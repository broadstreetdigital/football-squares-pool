-- Add email consent field to users table
-- This tracks whether users have consented to receive emails

ALTER TABLE users ADD COLUMN email_consent INTEGER NOT NULL DEFAULT 0;
