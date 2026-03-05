const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        console.log('Adding document_type to students table...');
        await pool.query(`
      ALTER TABLE students 
      ADD COLUMN document_type VARCHAR(20) DEFAULT 'CEDULA';
    `);
        console.log('Successfully added document_type column to students table');
    } catch (error) {
        if (error.code === '42701') {
            console.log('Column document_type already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    } finally {
        await pool.end();
    }
}

run();
