-- ============================================================================
-- Femorae ID System — PostgreSQL session-store migration (Stage 5C)
-- Target: EXISTING databases, before deploying the pg session store code.
--
-- Schema is connect-pg-simple's documented table, quoted exactly as the
-- store expects by default (tableName "session"). Rerunnable via
-- IF NOT EXISTS. No application tables touched, no data modified.
-- DO NOT EXECUTE without approval.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
