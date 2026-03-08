-- Fix missing columns in billing tables
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS scholarship_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

ALTER TABLE invoice_details ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0;

-- Ensure permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO educrm_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO educrm_user;
