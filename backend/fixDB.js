const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public' });
async function fix() {
    await pool.query("UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE email = 'admin@educrm.com';");
    console.log('Fixed admin role');
    process.exit(0);
}
fix();
