const db = require("../utils/db");

async function getAllSubscriptions() {
  const sql = `SELECT j1.*, j2.scheduled_at AS scheduled_at FROM jobs j1 LEFT JOIN jobs j2 ON j1.discord_id = j2.discord_id AND j2.status = 'scheduled' AND j2.scheduled_at > j1.scheduled_at AND j2.scheduled_at < DATE_ADD(j1.scheduled_at, INTERVAL 35 DAY) WHERE j1.status != 'scheduled' ORDER BY j1.scheduled_at DESC;`;
  const [rows] = await db.query(sql);
  return rows || null;
}

module.exports = {
  getAllSubscriptions,
};
