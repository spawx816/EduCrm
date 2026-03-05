-- Add invoice customization fields to company_settings
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS invoice_header TEXT,
ADD COLUMN IF NOT EXISTS invoice_footer TEXT;

-- Update existing row with some defaults if useful
UPDATE company_settings 
SET invoice_header = '¡Gracias por su preferencia!',
    invoice_footer = 'Este es un comprobante de pago.'
WHERE invoice_header IS NULL;
