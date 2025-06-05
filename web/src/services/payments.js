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

async function getAllLastestPayments() {
  const sql = `SELECT * FROM payments ORDER BY stripe_timestamp DESC;`;
  const [rows] = await db.query(sql);
  return rows || null;
}

async function updatePaymentsDiscordId(oldDiscordId, newDiscordId) {
  const sql = `UPDATE payments SET discord_id = ? WHERE discord_id = ?`;
  await db.query(sql, [newDiscordId, oldDiscordId]);
}

module.exports = {
  savePayment,
  getAllLastestPayments,
  updatePaymentsDiscordId,
};
