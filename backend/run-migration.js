const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://casaos:casaos@10.0.0.8:5432/crmEdu?schema=public',
});

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'sql/migrations/20260226_student_avatar.sql'), 'utf8');
        await pool.query(sql);
        console.log('Migration successful');
    } catch (error) {
        console.error('Migration failed', error);
    } finally {
        await pool.end();
    }
}

runMigration();
