const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });

    try {
        const res = await pool.query(
            "UPDATE billing_items SET is_inventory = true WHERE is_inventory = false AND name NOT ILIKE '%Inscripción%' AND name NOT ILIKE '%Módulo%'"
        );
        console.log(`Updated ${res.rowCount} items to be inventoriable.`);
    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

main();
