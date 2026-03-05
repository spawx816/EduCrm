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

        // Check if columns exist first
        const checkCols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'leads' AND column_name IN ('document_type', 'document_id', 'address')
        `);

        const existingCols = checkCols.rows.map(r => r.column_name);

        if (!existingCols.includes('document_type')) {
            await pool.query("ALTER TABLE leads ADD COLUMN document_type VARCHAR(20) DEFAULT 'CEDULA'");
            console.log('Added document_type');
        }

        if (!existingCols.includes('document_id')) {
            await pool.query("ALTER TABLE leads ADD COLUMN document_id VARCHAR(50)");
            console.log('Added document_id');
        }

        if (!existingCols.includes('address')) {
            await pool.query("ALTER TABLE leads ADD COLUMN address TEXT");
            console.log('Added address');
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}
migrate();
