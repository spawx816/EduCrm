const { Pool } = require('pg');
const connectionString = "postgresql://casaos:casaos@10.0.0.8:5432/crmEdu?schema=public";
const pool = new Pool({ connectionString, ssl: false });

async function check() {
    try {
        const res = await pool.query("SELECT extname FROM pg_extension");
        console.log('EXTENSIONS:', res.rows.map(r => r.extname).join(', '));
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await pool.end();
    }
}
check();
