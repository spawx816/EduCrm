const { Pool } = require('pg');
const connectionString = "postgresql://casaos:casaos@10.0.0.8:5432/crmEdu?schema=public";
const pool = new Pool({ connectionString, ssl: false });

async function fix() {
    try {
        console.log('--- FORCING TABLE CREATION ---');

        // 1. chat_conversations
        try {
            await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                external_id VARCHAR(255),
                source VARCHAR(50) NOT NULL,
                lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
                status VARCHAR(20) DEFAULT 'OPEN',
                metadata JSONB DEFAULT '{}',
                last_message_at TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(external_id, source)
            )
        `);
            console.log('SUCCESS: chat_conversations created or exists.');
        } catch (e) {
            console.error('FAILED chat_conversations:', e.message);
        }

        // 2. chat_messages
        try {
            await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
                sender_type VARCHAR(20) NOT NULL,
                sender_id UUID,
                content TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                metadata JSONB DEFAULT '{}',
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
            console.log('SUCCESS: chat_messages created or exists.');
        } catch (e) {
            console.error('FAILED chat_messages:', e.message);
        }

        console.log('--- FIX FINISHED ---');
    } catch (err) {
        console.error('Global fix failed:', err.message);
    } finally {
        await pool.end();
    }
}
fix();
