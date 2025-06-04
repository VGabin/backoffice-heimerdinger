const db = require("../utils/db");

async function getAllSubscriptions() {
  const sql = `WITH latest_non_scheduled AS (
      SELECT *
      FROM (
        SELECT *,
              ROW_NUMBER() OVER (PARTITION BY discord_id ORDER BY scheduled_at DESC) AS rn
        FROM jobs
        WHERE status != 'scheduled'
      ) AS ranked
      WHERE rn = 1
    ),
    latest_scheduled AS (
      SELECT discord_id, scheduled_at AS override_scheduled_at
      FROM (
        SELECT *,
              ROW_NUMBER() OVER (PARTITION BY discord_id ORDER BY scheduled_at DESC) AS rn
        FROM jobs
        WHERE status = 'scheduled'
      ) AS ranked_scheduled
      WHERE rn = 1
    )
    SELECT
      j.id,
      j.created_at,
      j.type,
      j.status,
      COALESCE(s.override_scheduled_at, j.scheduled_at) AS scheduled_at,
      j.stripe_id,
      j.transaction_id,
      j.discord_id,
      j.try_count,
      j.role
    FROM latest_non_scheduled j
    LEFT JOIN latest_scheduled s ON j.discord_id = s.discord_id;`;
  const [rows] = await db.query(sql);
  return rows || null;
}

module.exports = {
  getAllSubscriptions,
};
