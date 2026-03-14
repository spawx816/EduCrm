const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public' });

async function checkTables() {
    const res = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log(res.rows.map(r => r.tablename));
    process.exit(0);
}

checkTables().catch(e => { console.error(e); process.exit(1); });
