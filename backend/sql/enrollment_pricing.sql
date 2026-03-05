ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS enrollment_price DECIMAL(12,2) DEFAULT 0;
