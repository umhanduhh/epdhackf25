-- Add source column to badges table
ALTER TABLE badges 
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('PLATFORM', 'JOURNEY', 'COMMUNITY'));

-- Update existing badges if any exist
UPDATE badges SET source = 'PLATFORM' WHERE code LIKE '%_verified';
UPDATE badges SET source = 'JOURNEY' WHERE code IN ('journey_starter', 'milestone_master');
UPDATE badges SET source = 'COMMUNITY' WHERE code LIKE 'helper_level_%';
