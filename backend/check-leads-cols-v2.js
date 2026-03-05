const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://casaos:casaos@10.0.0.8:5432/crmEdu?schema=public", ssl: false });

async function check() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads'");
        console.log('---LEADS_COLUMNS---');
        res.rows.forEach(r => console.log(r.column_name));
        console.log('---END---');
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await pool.end();
    }
}
check();
