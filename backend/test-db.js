const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public',
    ssl: false
});

async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW() as current_time');
        console.log('Connection successful! Database time:', res.rows[0].current_time);
    } catch (error) {
        console.error('Connection failed:', error.message);
    } finally {
        await pool.end();
    }
}

testConnection();
