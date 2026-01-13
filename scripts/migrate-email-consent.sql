-- Add email_consent column to users table
-- Run this with: turso db shell <database-name> < scripts/migrate-email-consent.sql

-- Add email_consent column (defaults to 0/false for existing users)
ALTER TABLE users ADD COLUMN email_consent INTEGER NOT NULL DEFAULT 0;
