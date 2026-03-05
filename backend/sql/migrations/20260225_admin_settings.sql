-- Admin Settings Migration
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'EduCRM',
    logo_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#2563eb',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings if none exist
INSERT INTO company_settings (company_name, primary_color)
SELECT 'EduCRM', '#2563eb'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);
