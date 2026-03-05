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

async function migrate() {
    try {
        console.log('Running migration to add document_type and document_id to leads table...');

        // Simple alter table with IF NOT EXISTS equivalent logic
        try {
            await pool.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS document_type VARCHAR(20) DEFAULT 'CEDULA'");
            console.log('Processed document_type');
        } catch (e) { console.log('document_type might already exist or error:', e.message); }

        try {
            await pool.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS document_id VARCHAR(50)");
            console.log('Processed document_id');
        } catch (e) { console.log('document_id might already exist or error:', e.message); }

        try {
            await pool.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT");
            console.log('Processed address');
        } catch (e) { console.log('address might already exist or error:', e.message); }

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}
migrate();
