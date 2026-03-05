-- Add billing_day to academic_programs
-- Defaults to 5 (5th of each month) as a common billing day
ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS billing_day INTEGER DEFAULT 5;
