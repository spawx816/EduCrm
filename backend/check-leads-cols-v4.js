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
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads'");
        console.log('---LEADS_COLUMNS---');
        res.rows.forEach(r => console.log(r.column_name));
        console.log('---END---');
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await pool.end();
    }
}
check();
