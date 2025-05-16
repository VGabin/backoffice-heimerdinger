const stripe = require("stripe")(process.env.STRIPE_SECRET);

const TransactionExport = async (req, res) => {
  try {
    const payments = await stripe.paymentIntents.list({
      limit: 10,
    });
    return payments;
  } catch (error) {
    return error;
  }
}

module.exports = TransactionExport;