-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Update existing users with a placeholder hash (run seed script to set real passwords)
UPDATE users SET password_hash = '' WHERE password_hash IS NULL;

-- Add indexes for auth performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
