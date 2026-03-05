const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public',
    ssl: false
});

async function runSplit() {
    try {
        const schemaSql = fs.readFileSync(path.join(__dirname, 'sql/schema.sql'), 'utf8');
        const statements = schemaSql.split(';').filter(s => s.trim().length > 0);

        for (let i = 0; i < statements.length; i++) {
            try {
                console.log(`Running statement ${i + 1}...`);
                await pool.query(statements[i]);
                console.log(`Success statement ${i + 1}`);
            } catch (e) {
                console.error(`FAILED on statement ${i + 1}:`, statements[i].trim().substring(0, 100) + '...', e.message);
                break;
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

runSplit();
