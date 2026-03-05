const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    let output = '';
    try {
        output += '--- Checking Tables ---\n';
        const tables = ['academic_module_addons', 'billing_items', 'inventory_transactions'];
        for (const table of tables) {
            const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1", [table]);
            if (res.rows.length > 0) {
                output += `FOUND: ${table}\n`;

                // Check columns
                const colRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table]);
                output += 'Columns:\n';
                colRes.rows.forEach(c => output += ` - ${c.column_name} (${c.data_type})\n`);
            } else {
                output += `NOT FOUND: ${table}\n`;
            }
            output += '-----------------------\n';
        }
    } catch (err) {
        output += `Check failed: ${err.message}\n`;
    } finally {
        fs.writeFileSync('inventory_check_result.txt', output);
        await pool.end();
    }
}
check();
