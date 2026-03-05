const { Pool } = require('pg');
const connectionString = "postgresql://casaos:casaos@10.0.0.8:5432/crmEdu?schema=public";
const pool = new Pool({ connectionString, ssl: false });

async function debug() {
    try {
        const res = await pool.query("SELECT id, message_type, content, metadata FROM chat_messages ORDER BY created_at DESC LIMIT 3");
        console.log('LAST 3 MESSAGES:');
        res.rows.forEach(m => {
            const metadataKeys = m.metadata ? Object.keys(m.metadata) : 'null';
            const hasMedia = m.metadata && m.metadata.media ? 'YES' : 'NO';
            const base64Len = m.metadata && m.metadata.media && m.metadata.media.base64 ? m.metadata.media.base64.length : 0;
            console.log(`ID: ${m.id}, TYPE: ${m.message_type}, CONTENT: ${m.content}, METADATA_KEYS: ${metadataKeys}, HAS_MEDIA: ${hasMedia}, B64_LEN: ${base64Len}`);
        });
    } catch (err) {
        console.error('Debug failed:', err.message);
    } finally {
        await pool.end();
    }
}
debug();
