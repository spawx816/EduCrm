const { Pool } = require('pg');
const connectionString = "postgresql://casaos:casaos@10.0.0.8:5432/crmEdu?schema=public";
const pool = new Pool({ connectionString, ssl: false });

async function check() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_conversations'");
        console.log('COLUMNS IN chat_conversations:');
        res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await pool.end();
    }
}
check();
