const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSql(filePath) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        try {
            const sql = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
            await client.query(sql);
            console.log(`Executed ${filePath} successfully!`);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(`Error executing ${filePath}:`, err);
    } finally {
        await pool.end();
    }
}

runSql(process.argv[2] || 'sql/instructor_payroll.sql');
