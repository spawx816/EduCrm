const { Pool } = require('pg');
async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'leads' ORDER BY column_name");
        console.log('Columns in leads table:');
        res.rows.forEach(row => console.log('- ' + row.column_name));
    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    } finally {
        await pool.end();
    }
}
main();
