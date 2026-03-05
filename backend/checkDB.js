const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public' });
async function check() {
    const users = await pool.query('SELECT id, email, role_id FROM users;');
    const roles = await pool.query('SELECT * FROM roles;');
    fs.writeFileSync('db_output.json', JSON.stringify({ users: users.rows, roles: roles.rows }, null, 2));
    process.exit(0);
}
check();
