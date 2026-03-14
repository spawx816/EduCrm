const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public' });

async function checkCount() {
    const res = await pool.query("SELECT COUNT(*) FROM users");
    console.log('Total users:', res.rows[0].count);
    process.exit(0);
}

checkCount().catch(e => { console.error(e); process.exit(1); });
