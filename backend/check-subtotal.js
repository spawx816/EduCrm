const { Pool } = require('pg');
require('dotenv').config();

async function checkSubtotal() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pool.query(
            `SELECT column_name, is_nullable, column_default, data_type 
             FROM information_schema.columns 
             WHERE table_name = 'invoice_details' AND column_name = 'subtotal'`
        );
        console.log(JSON.stringify(res.rows));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkSubtotal();
