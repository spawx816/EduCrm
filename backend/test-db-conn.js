const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env loader
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^"|"$/g, '');
        }
    });
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function check() {
    try {
        const res = await pool.query("SELECT 1 as connected");
        console.log('CONNECTED:', res.rows[0].connected);

        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'leads'");
        console.log('COLUMNS:', cols.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error('FAILED:', err.message);
    } finally {
        await pool.end();
    }
}
check();
