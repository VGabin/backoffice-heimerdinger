const db = require("../utils/db");

async function savePayment(discordId, amount, timestamp) {
  const sql = `INSERT INTO payments (discord_id, amount, timestamp) VALUES (?, ?, ?)`;
  await db.query(sql, [discordId, amount, timestamp]);
}

async function getLatestPayment(discordId) {
  const [rows] = await db.query(
    `SELECT * FROM payments WHERE discord_id = ? ORDER BY timestamp DESC LIMIT 1`,
    [discordId]
  );
  return rows[0] || null;
}

module.exports = {
  savePayment,
  getLatestPayment,
};
