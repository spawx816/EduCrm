-- Inventory System Migration
-- 1. Add inventory fields to billing_items
ALTER TABLE billing_items 
ADD COLUMN IF NOT EXISTS is_inventory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;

-- 2. Create inventory_movements table for traceability
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES billing_items(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'IN' (Entry), 'OUT' (Sale/Adjustment)
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'INVOICE', 'MANUAL_ADJUSTMENT', 'PURCHASE'
    reference_id UUID, -- Can be invoice_id or null
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 3. Create index for faster stock lookups
CREATE INDEX IF NOT EXISTS idx_inventory_item_id ON inventory_movements(item_id);
