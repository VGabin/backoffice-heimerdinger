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

async function findLatestPaymentByDiscordId(discordId) {
  const sql = `SELECT * FROM payments WHERE discord_id = ? AND status = 'paid' ORDER BY stripe_timestamp DESC LIMIT 1`;
  const [rows] = await db.query(sql, [discordId]);
  return rows[0] || null;
}

module.exports = {
  savePayment,
  findLatestPaymentByDiscordId,
};
