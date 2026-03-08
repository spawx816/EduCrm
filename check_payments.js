const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });

    try {
        const res = await pool.query('SELECT * FROM invoice_payments');
        console.log(`Found ${res.rowCount} payments.`);
        res.rows.forEach(r => console.log(JSON.stringify(r)));
    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

main();
