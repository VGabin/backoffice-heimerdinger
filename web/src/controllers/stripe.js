const {
  savePayment,
} = require("../services/payments");

async function stripeEventHandlers (event) {
  const type = event.type;

  switch (type) {
    case "invoice.paid":
    case "checkout.session.completed": {
      const stripeId = event.id;
      const session = event.data.object;
      const transactionId = session.id;
      const discordId = session.client_reference_id || session.customer; // TODO: Ensure this is the correct field for Discord ID
      const amount = session.amount_total / 100 || session.amount_paid / 100;
      const timestamp = new Date(session.created * 1000);
      const status = session.payment_status || "paid";

      return savePayment(
        type,
        stripeId,
        transactionId,
        discordId,
        amount,
        timestamp,
        status
      );
    }
  }

  return Promise.resolve();
}

module.exports = stripeEventHandlers;
