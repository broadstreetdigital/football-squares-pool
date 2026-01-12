-- Add pool_invitations table to existing database
-- Run this with: turso db shell <database-name> < scripts/migrate-pool-invitations.sql

-- Pool Invitations table
CREATE TABLE IF NOT EXISTS pool_invitations (
  id TEXT PRIMARY KEY,
  pool_id TEXT NOT NULL,
  invited_email TEXT NOT NULL,
  invited_name TEXT NOT NULL,
  invited_by_user_id TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  claimed_squares_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'expired')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  accepted_at INTEGER,
  created_user_id TEXT,
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pool_invitations_pool_id ON pool_invitations(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_invitations_email ON pool_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_pool_invitations_token ON pool_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_pool_invitations_status ON pool_invitations(status);
