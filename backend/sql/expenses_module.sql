-- Categorías de Gastos
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Gastos
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES expense_categories(id),
    amount DECIMAL(15, 2) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    payment_method VARCHAR(50), -- Efectivo, Transferencia, Tarjeta, etc.
    reference_number VARCHAR(100), -- Número de recibo o factura del proveedor
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías por defecto
INSERT INTO expense_categories (name, description, is_system) VALUES 
('Renta y Local', 'Gastos de alquiler de instalaciones', true),
('Servicios Públicos', 'Luz, agua, internet, telefonía', true),
('Suministros y Papelería', 'Material de oficina y limpieza', true),
('Marketing y Publicidad', 'Facebook Ads, Google Ads, volantes', true),
('Mantenimiento', 'Reparaciones y mejoras del local', true),
('Impuestos y Licencias', 'Pagos al gobierno y permisos', true),
('Otros', 'Gastos generales no categorizados', true)
ON CONFLICT (name) DO NOTHING;

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
