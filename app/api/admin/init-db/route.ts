/**
 * POST /api/admin/init-db
 * Initialize database schema
 * Should be called once on first deployment
 *
 * SECURITY: This endpoint is disabled in production for security.
 * Use Turso CLI or database migrations instead.
 */

import { NextResponse } from 'next/server';
import { initializeSchema } from '@/lib/db/client';


const SCHEMA_SQL = `
-- Football Squares Pool Database Schema
-- SQLite compatible for Webflow Cloud edge runtime

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Pools table
CREATE TABLE IF NOT EXISTS pools (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  game_name TEXT NOT NULL,
  game_time INTEGER NOT NULL,
  entry_fee_info TEXT,
  square_price REAL NOT NULL DEFAULT 0,
  max_squares_per_user INTEGER NOT NULL DEFAULT 10,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'private')),
  invite_code_hash TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'locked', 'numbered', 'completed')),
  rules TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pools_owner ON pools(owner_id);
CREATE INDEX IF NOT EXISTS idx_pools_status ON pools(status);
CREATE INDEX IF NOT EXISTS idx_pools_created ON pools(created_at DESC);

-- Squares table (100 squares per pool)
CREATE TABLE IF NOT EXISTS squares (
  pool_id TEXT NOT NULL,
  row INTEGER NOT NULL CHECK(row >= 0 AND row <= 9),
  col INTEGER NOT NULL CHECK(col >= 0 AND col <= 9),
  claimed_by_user_id TEXT,
  claimed_display_name TEXT,
  claimed_email TEXT,
  claimed_at INTEGER,
  PRIMARY KEY (pool_id, row, col),
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
  FOREIGN KEY (claimed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_squares_user ON squares(claimed_by_user_id, pool_id);
CREATE INDEX IF NOT EXISTS idx_squares_pool ON squares(pool_id);

-- Axis assignments (randomized digits)
CREATE TABLE IF NOT EXISTS axis_assignments (
  pool_id TEXT PRIMARY KEY,
  x_digits_json TEXT NOT NULL,
  y_digits_json TEXT NOT NULL,
  randomized_at INTEGER NOT NULL,
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  pool_id TEXT NOT NULL,
  bucket TEXT NOT NULL CHECK(bucket IN ('Q1', 'Q2', 'Q3', 'Q4', 'FINAL')),
  home_score INTEGER NOT NULL CHECK(home_score >= 0),
  away_score INTEGER NOT NULL CHECK(away_score >= 0),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (pool_id, bucket),
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scores_pool ON scores(pool_id);

-- Event log (audit trail)
CREATE TABLE IF NOT EXISTS event_log (
  id TEXT PRIMARY KEY,
  pool_id TEXT NOT NULL,
  actor_user_id TEXT,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_log_pool ON event_log(pool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_log_type ON event_log(type, created_at DESC);
`;

async function initDb() {
  // SECURITY: Disable in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        success: false,
        error: 'Database initialization is disabled in production',
        message: 'Use Turso CLI for production database management: turso db shell <database-name>',
      },
      { status: 403 }
    );
  }

  try {
    initializeSchema(SCHEMA_SQL);

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Remove GET method - only POST should be allowed for state-changing operations
export async function POST() {
  return initDb();
}
