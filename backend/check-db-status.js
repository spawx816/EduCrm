const { Pool } = require('pg');
require('dotenv').config();

async function checkStatus() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const tables = ['students', 'leads', 'billing_items', 'invoices', 'users'];
        console.log('--- Database Status ---');
        for (const table of tables) {
            try {
                const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`${table}: ${res.rows[0].count} records`);
            } catch (err) {
                console.log(`${table}: Error or table does not exist`);
            }
        }
    } catch (err) {
        console.error('Error connecting to database:', err);
    } finally {
        await pool.end();
    }
}

checkStatus();
