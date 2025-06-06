const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const stripeEventHandlers = require("../services/stripe");
const {
  findJobAssignRoleByDiscordId,
  updateJobStatusById,
  getAllJobsToDo,
  updateJobsDiscordId,
  updateJobsDate,
} = require("../services/jobs");

const {
  updatePaymentsDiscordId,
} = require("../services/payments");

// Webhook Stripe on payment success
router.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).send("Signature manquante");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Erreur : ${err.message}`);
    }

    const type = event.type;

    try {
      await stripeEventHandlers(event);
    } catch (err) {
      return res.status(500).send(`Erreur dans handler Stripe`);
    }

    res.status(200).send("OK");
  }
);

// TODO : Route on Join
router.get("/join", async (req, res) => {
  const { discordId } = req.query;

  if (!discordId) {
    return res.status(400).json({ error: "Discord ID is required" });
  }

  try {
    const hasJob = await findJobAssignRoleByDiscordId(discordId);

    if (!hasJob) {
      return res.status(204).json({ error: "Aucune tâche trouvée pour cet utilisateur" });
    }

    await updateJobStatusById(hasJob.id, "processing");

    return res.status(200).json({type: hasJob.type, role: hasJob.role});
  } catch (error) {
    res.status(500).json(error);
  }
});

// TODO : Route on Schedule
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await getAllJobsToDo();

    jobs.forEach(async (job) => {
      await updateJobStatusById(job.id, "processing");
    });

    return res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/done", async (req, res) => {
  const { jobId } = req.query;


  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  try {
    await updateJobStatusById(jobId, "success");

    return res.status(200).json({ statut: "done" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/update", async (req, res) => {
  const { oldDiscordId, oldDate } = req.query;
  const { newDiscordId, newDate } = req.body;

  if (!oldDiscordId || !newDiscordId || !oldDate || !newDate) {
    return res.status(400).send("Paramètres manquants");
  }

  try {
    await updateJobsDiscordId(oldDiscordId, newDiscordId);
    await updatePaymentsDiscordId(oldDiscordId, newDiscordId);

    const formatToDateOnly = (d) => new Date(d).toISOString().slice(0, 10);

    if (formatToDateOnly(oldDate) !== formatToDateOnly(newDate)) {
      await updateJobsDate(newDiscordId, newDate, new Date());
    }
  } catch (error) {
    res.status(500).json(error);
  }

  res.redirect("/abonnements");
});

module.exports = router;
