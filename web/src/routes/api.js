const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { getRoleFromAmount } = require("../utils/data");
const stripeEventHandlers = require("../controllers/stripe");
const {
  findJobAssignRoleByDiscordId,
  updateJobStatusById,
  getAllJobsToDo,
} = require("../services/jobs");

// Webhook Stripe on payment success
router.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

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
      return res.status(404).json({ error: "Aucune tâche trouvée pour cet utilisateur" });
    }

    await updateJobStatusById(hasJob.id, "success");

    return res.status(200).json({ role: hasJob.role });
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

    return res.status(404).json(jobs);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
