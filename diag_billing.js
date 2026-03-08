const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });

    try {
        const columnsRes = await pool.query(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'billing_items'`
        );
        console.log('--- COLUMNS ---');
        columnsRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        const rowsRes = await pool.query('SELECT * FROM billing_items');
        console.log('\n--- ROWS ---');
        console.log(JSON.stringify(rowsRes.rows, null, 2));

    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

main();
