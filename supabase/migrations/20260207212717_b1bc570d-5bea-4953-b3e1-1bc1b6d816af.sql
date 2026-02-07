-- 1. Backup existing mosques (safety net)
CREATE TABLE IF NOT EXISTS mosques_backup_20260207 AS SELECT * FROM mosques;

-- 2. Add new columns
ALTER TABLE mosques
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS has_womens_section BOOLEAN,
ADD COLUMN IF NOT EXISTS usage_type TEXT DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS is_multi_faith BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS management TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_page TEXT;

-- 3. Add CHECK constraint for usage_type
ALTER TABLE mosques
ADD CONSTRAINT valid_usage_type 
CHECK (usage_type IN ('regular', 'jummah_only', 'no_jummah', 'irregular', 'community_center'));

-- 4. Truncate all mosque data (related tables are empty so CASCADE is safe)
TRUNCATE TABLE mosques CASCADE;