const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const {
  findLatestPaymentByDiscordId,
} = require("../services/payments");
const { getRoleFromAmount } = require("../utils/data");
const stripeEventHandlers = require("../controllers/stripe");

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
      console.error("❌ Erreur de vérification webhook:", err.message);
      return res.status(400).send(`Erreur : ${err.message}`);
    }

    const type = event.type;

    try {
      await stripeEventHandlers(event);
    } catch (err) {
      console.error(`❌ Erreur dans le handler pour ${type}:`, err);
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
    const dbPayment = await findLatestPaymentByDiscordId(discordId);

    if (dbPayment) {
      const role = getRoleFromAmount(dbPayment.amount);
      return res.status(200).json({ role });
    }
    return res.status(404).json({ error: "No valid payment found" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// TODO : Route on Schedule
router.get("/schedule", async (req, res) => {
  try {
    const dbPayment = await findLatestPaymentByDiscordId(discordId);

    if (dbPayment) {
      const role = getRoleFromAmount(dbPayment.amount);
      return res.status(200).json({ role });
    }
    return res.status(404).json({ error: "No valid payment found" });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
