-- Add goal_value and goal_unit columns to journeys table
ALTER TABLE journeys 
ADD COLUMN IF NOT EXISTS goal_value NUMERIC,
ADD COLUMN IF NOT EXISTS goal_unit TEXT,
ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0;

-- Add comment to explain the columns
COMMENT ON COLUMN journeys.goal_value IS 'Target value for the journey (e.g., 5000 for $5000 savings)';
COMMENT ON COLUMN journeys.goal_unit IS 'Unit of measurement (e.g., dollars, stars, connections)';
COMMENT ON COLUMN journeys.current_value IS 'Current progress value';
