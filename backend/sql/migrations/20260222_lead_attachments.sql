-- Lead Attachments
CREATE TABLE IF NOT EXISTS lead_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100),
    size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_lead_attachments_lead_id ON lead_attachments(lead_id);
