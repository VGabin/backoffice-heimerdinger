const db = require("../utils/db");

async function savePayment(
  type,
  stripeId,
  transactionId,
  discordId,
  amount,
  timestamp,
  status
) {
  const sql = `INSERT INTO payments (type, stripe_id, transaction_id, discord_id, amount, stripe_timestamp, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await db.query(sql, [
    type,
    stripeId,
    transactionId,
    discordId,
    amount,
    timestamp,
    status,
  ]);
}

module.exports = {
  savePayment
};
