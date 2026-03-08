const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });

    try {
        const res = await pool.query("SELECT SUM(amount) as total, COUNT(*) as count, NOW() as current_time FROM invoice_payments WHERE created_at > NOW() - INTERVAL '30 days'");
        console.log('Result:', res.rows[0]);

        const all = await pool.query("SELECT amount, created_at FROM invoice_payments");
        console.log('All payments:', all.rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

main();
