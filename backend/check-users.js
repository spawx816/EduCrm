const { Pool } = require('pg');
require('dotenv').config();

async function checkUsers() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        try {
            console.log('--- Roles ---');
            const roles = await client.query('SELECT name, display_name FROM roles');
            console.table(roles.rows);

            console.log('\n--- Users with Roles ---');
            const users = await client.query(`
                SELECT u.email, r.name as role, u.first_name, u.last_name 
                FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.deleted_at IS NULL
            `);
            console.table(users.rows);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        await pool.end();
    }
}

checkUsers();
