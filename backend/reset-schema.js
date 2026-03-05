const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public',
    ssl: false
});

async function run() {
    try {
        await pool.query('DROP SCHEMA IF EXISTS public CASCADE;');
        await pool.query('CREATE SCHEMA public;');
        console.log('Schema reset successfully!');
    } catch (err) {
        console.error('Error resetting schema:', err.message);
    } finally {
        await pool.end();
    }
}
run();
