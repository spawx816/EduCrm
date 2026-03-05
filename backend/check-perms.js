const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public',
    ssl: false
});

async function checkPerms() {
    try {
        const res = await pool.query('SELECT current_user, current_schema(), (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) as is_superuser');
        console.log('Permissions:', res.rows[0]);

        const info = await pool.query('SELECT version()');
        console.log('Version:', info.rows[0].version);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkPerms();
