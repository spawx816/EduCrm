const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public',
    ssl: false
});

async function run() {
    try {
        const res = await pool.query(`SHOW search_path;`);
        console.log('Search Path:', res.rows[0]);

        // Try to create just one table explicitly in public
        await pool.query(`
      CREATE TABLE public.test_table (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid()
      );
    `);
        console.log('Successfully created table in public schema!');
        await pool.query('DROP TABLE public.test_table');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

run();
