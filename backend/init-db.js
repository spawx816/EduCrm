const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Reading schema.sql...');
        const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');

        console.log('Connecting to database...');
        const client = await pool.connect();

        try {
            console.log('Executing schema...');
            await client.query(schema);
            console.log('Schema initialized successfully!');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initDb();
