const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { savePayment, findLatestPaymentByDiscordId } = require("../services/payments");
const { getRoleFromAmount } = require("../utils/data");

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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const discordId = session.client_reference_id || "";
      const amount = session.amount_total / 100;
      const timestamp = new Date(session.created * 1000);
      try {
        await savePayment(discordId, amount, timestamp);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du paiement:", error);
        return res.status(500).send("Erreur lors de l'enregistrement du paiement");
      }
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

module.exports = router;
