const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });

    const tables = ['invoices', 'invoice_details', 'invoice_payments'];

    try {
        for (const table of tables) {
            const res = await pool.query(
                `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY column_name`,
                [table]
            );
            console.log(`--- Columns in ${table} ---`);
            res.rows.forEach(row => console.log(`- ${row.column_name}`));
            console.log('');
        }
    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

main();
