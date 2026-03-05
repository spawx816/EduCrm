-- Modular Pricing & Addons Schema
-- 1. Add price to academic_modules
ALTER TABLE academic_modules ADD COLUMN IF NOT EXISTS price DECIMAL(12,2) DEFAULT 0;

-- 2. Table for Module Addons (Optional Items)
CREATE TABLE IF NOT EXISTS academic_module_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES academic_modules(id) ON DELETE CASCADE,
    item_id UUID REFERENCES billing_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, item_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_module_addons_module_id ON academic_module_addons(module_id);
