const { savePayment } = require("../services/payments");
const { createJob } = require("../services/jobs");
const { getRoleFromAmount } = require("../utils/data");

async function stripeEventHandlers(event) {
  const type = event.type;

  switch (type) {
    case "invoice.paid":
    case "payment_intent.succeeded":
    case "checkout.session.completed": {
      const stripeId = event.id;
      const session = event.data.object;
      const transactionId = session.id;
      const discordId = session.client_reference_id || session.customer; // TODO: Ensure this is the correct field for Discord ID
      const amount =
        session.amount_total / 100 ||
        session.amount_paid / 100 ||
        session.amount_received / 100;
      const timestamp = new Date(session.created * 1000);
      const status = session.payment_status || "paid";

      try {
        await savePayment(
          type,
          stripeId,
          transactionId,
          discordId,
          amount,
          timestamp,
          status
        );

        let role = getRoleFromAmount(amount);

        // Job to assign role
        await createJob(
          "assign_role",
          "pending",
          timestamp,
          discordId,
          role,
          stripeId,
          transactionId
        );

        // Program to delete role after 30 days
        await createJob(
          "remove_role",
          "scheduled",
          new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000),
          discordId,
          role,
          stripeId,
          transactionId
        );
      } catch (err) {
        console.error(err);
      }

      break;
    }

    case "invoice.payment_failed":
    case "customer.subscription.deleted":
    case "charge.refunded":
    case "charge.dispute.created": {
      const stripeId = event.id;
      const session = event.data.object;
      const transactionId = session.id;
      const discordId = session.client_reference_id || session.customer; // TODO: Ensure this is the correct field for Discord ID
      const amount = 0;
      const timestamp = new Date(session.created * 1000);
      const status = session.payment_status || "failed";

      try {
        await savePayment(
          type,
          stripeId,
          transactionId,
          discordId,
          amount,
          timestamp,
          status
        );

        // Job to remove role if it exists
        await createJob(
          "remove_role",
          "pending",
          timestamp,
          discordId,
          "unassigned",
          stripeId,
          transactionId
        );
      } catch (err) {
        console.error(err);
      }

      break;
    }
  }

  return Promise.resolve();
}

module.exports = stripeEventHandlers;
