const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });

    const tables = ['invoices', 'invoice_details', 'invoice_payments'];

    try {
        for (const table of tables) {
            const res = await pool.query(
                `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
                [table]
            );
            console.log(`--- Table: ${table} ---`);
            const cols = res.rows.map(r => r.column_name).sort();
            cols.forEach(c => console.log(`  ${c}`));
        }
    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

main();
