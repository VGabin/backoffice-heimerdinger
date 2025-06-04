const db = require("../utils/db");

async function createJob(type, status, scheduledAt, discordId, role, stripe_id, transaction_id) {
  const sql = `INSERT INTO jobs (type, status, scheduled_at, discord_id, role, stripe_id, transaction_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await db.query(sql, [type, status, scheduledAt, discordId, role, stripe_id, transaction_id]);
}

async function findJobAssignRoleByDiscordId(discordId) {
  const sql = `SELECT * FROM jobs WHERE discord_id = ? AND type = 'assign_role' AND status in ('success', 'pending', 'processing') AND scheduled_at <= NOW()`;
  const [rows] = await db.query(sql, [discordId]);
  return rows[0] || null;
}

async function updateJobStatusById(jobId, status) {
  const sql = `UPDATE jobs SET status = ?, try_count = try_count + 1 WHERE id = ?`;
  await db.query(sql, [status, jobId]);
}

async function getAllJobsToDo() {
  const sql = `SELECT id, type, discord_id, role FROM jobs WHERE status in ('pending', 'processing', 'scheduled') AND scheduled_at >= CURDATE() AND scheduled_at < CURDATE() + INTERVAL 1 DAY`;
  const [rows] = await db.query(sql);
  return rows;
}

module.exports = {
  createJob,
  findJobAssignRoleByDiscordId,
  updateJobStatusById,
  getAllJobsToDo,
};
