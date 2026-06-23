const { pool } = require('../db');

async function logAudit({ userId = null, action, metadata = {} }) {
  if (!action) return;

  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, metadata)
       VALUES ($1, $2, $3::jsonb)`,
      [userId, action, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('[audit] Unable to write audit log:', error.message);
  }
}

module.exports = { logAudit };
