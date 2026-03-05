require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function clearData() {
    const client = await pool.connect();
    try {
        const tablesToTruncate = [
            'leads',
            'students',
            'enrollments',
            'invoices',
            'invoice_items',
            'payments',
            'instructor_payments',
            'attendance',
            'grades',
            'exam_attempts',
            'student_attachments',
            'expenses',
            'inventory_movements',
            'bookings'
        ];

        console.log('Truncating tables...');
        for (const table of tablesToTruncate) {
            try {
                // First we check if table exists
                const exists = await client.query(`SELECT to_regclass('${table}') as exists`);
                if (exists.rows[0].exists) {
                    await client.query(`TRUNCATE TABLE ${table} CASCADE`);
                    console.log(`✓ Truncated ${table}`);
                } else {
                    console.log(`- Skipped ${table} (Does not exist)`);
                }
            } catch (err) {
                console.error(`X Error on ${table}: ${err.message}`);
            }
        }
        console.log('Database cleaned successfully.');
    } catch (e) {
        console.error('Fatal Error cleaning database:', e);
    } finally {
        client.release();
        pool.end();
    }
}

clearData();
