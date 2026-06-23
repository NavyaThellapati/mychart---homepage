const { Pool } = require('pg');
const { getDatabaseUrl } = require('./config');

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50) NOT NULL,
      username VARCHAR(255) NOT NULL UNIQUE,
      role VARCHAR(30) NOT NULL DEFAULT 'patient'
        CHECK (role IN ('patient', 'doctor', 'admin')),
      password_hash TEXT NOT NULL,
      password_reset_token TEXT,
      password_reset_expires TIMESTAMPTZ,
      mfa_enabled BOOLEAN NOT NULL DEFAULT false,
      otp_hash TEXT,
      otp_expires TIMESTAMPTZ,
      otp_attempts INTEGER NOT NULL DEFAULT 0,
      otp_session_token_hash TEXT,
      otp_session_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      appointment_type VARCHAR(150) NOT NULL,
      department_doctor VARCHAR(255) NOT NULL,
      doctor VARCHAR(150) NOT NULL,
      specialty VARCHAR(150) NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      starts_at TIMESTAMPTZ NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'Upcoming'
        CHECK (status IN ('Upcoming', 'Attended', 'Did not show up', 'Cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS appointments_user_starts_at_idx
      ON appointments(user_id, starts_at);

    ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'patient';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_hash TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_attempts INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_session_token_hash TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_session_expires TIMESTAMPTZ;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check
          CHECK (role IN ('patient', 'doctor', 'admin'));
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS audit_logs_user_created_at_idx
      ON audit_logs(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS audit_logs_action_created_at_idx
      ON audit_logs(action, created_at DESC);
  `);
}

module.exports = { pool, initializeDatabase };
