-- Chat System Migration
-- 20260222_chat_system.sql

-- Conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255), -- ID de WhatsApp/Instagram
    source VARCHAR(50) NOT NULL, -- 'whatsapp', 'instagram', 'web', etc
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED', 'ARCHIVED'
    metadata JSONB DEFAULT '{}',
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(external_id, source)
);

-- Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'lead', 'user', 'system'
    sender_id UUID, -- id del lead o del usuario admin
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'template'
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead_id ON chat_conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_external_id ON chat_conversations(external_id, source);
