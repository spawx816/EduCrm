const { Pool } = require('pg');
const connectionString = "postgresql://casaos:casaos@10.0.0.8:5432/crmEdu?schema=public";
const pool = new Pool({ connectionString, ssl: false });

async function check() {
    try {
        const tables = ['chat_conversations', 'chat_messages', 'lead_attachments', 'chat_message'];
        for (const table of tables) {
            const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1", [table]);
            if (res.rows.length > 0) {
                console.log(`FOUND: ${table}`);
            } else {
                console.log(`NOT FOUND: ${table}`);
            }
        }
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await pool.end();
    }
}
check();
