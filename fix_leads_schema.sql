-- Fix missing columns in leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS document_type VARCHAR(20) DEFAULT 'CEDULA';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS document_id VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT;

-- Standardize permissions again
GRANT ALL ON ALL TABLES IN SCHEMA public TO educrm_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO educrm_user;
