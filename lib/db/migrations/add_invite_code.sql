-- Add invite_code column to pools table
-- This stores the plain text invite code (only visible to owner)
ALTER TABLE pools ADD COLUMN invite_code TEXT;
