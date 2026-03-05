-- Scholarship Management Module

-- 1. Table for Scholarships
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED
    value DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Link Scholarships to Enrollments
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS scholarship_id UUID REFERENCES scholarships(id);

-- 3. Track Scholarship impact on Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS scholarship_id UUID REFERENCES scholarships(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;

-- 4. Initial Generic Scholarships
INSERT INTO scholarships (name, description, type, value) VALUES
('Beca Familiar', 'Descuento para hermanos o familiares directos', 'PERCENTAGE', 10.00),
('Beca Mérito Académico', 'Otorgada por excelencia en notas previas', 'PERCENTAGE', 25.00),
('Beca Completa', 'Cobertura total por convenio institucional', 'PERCENTAGE', 100.00),
('Descuento Pago Contado', 'Reducción fija por liquidación anticipada', 'FIXED', 50.00)
ON CONFLICT DO NOTHING;
