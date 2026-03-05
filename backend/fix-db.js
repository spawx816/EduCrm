const { Pool } = require('pg');
const connectionString = "postgresql://casaos:casaos@10.0.0.8:5432/crmEdu?schema=public";
const pool = new Pool({ connectionString, ssl: false });

async function fix() {
    try {
        console.log('--- STARTING FIX ---');
        // Ensure uuid-ossp
        await pool.query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"");
        console.log('Extension uuid-ossp ensured.');

        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('--- TABLES ---');
        tables.rows.forEach(r => console.log(r.table_name));
        console.log('--- END TABLES ---');
    } catch (err) {
        console.error('Fix failed:', err.message);
    } finally {
        await pool.end();
    }
}
fix();
