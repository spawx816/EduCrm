const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public',
    ssl: false
});

async function runTest(name, query) {
    try {
        await pool.query(query);
        console.log(`[SUCCESS] ${name}`);
        try { await pool.query(`DROP TABLE IF EXISTS public.t;`); } catch (e) { }
    } catch (e) {
        console.log(`[FAIL] ${name}: ${e.message}`);
        try { await pool.query(`DROP TABLE IF EXISTS public.t;`); } catch (e) { }
    }
}

async function run() {
    await runTest('UUID', 'CREATE TABLE public.t ( c UUID )');
    await runTest('VARCHAR', 'CREATE TABLE public.t ( c VARCHAR(50) )');
    await runTest('INT', 'CREATE TABLE public.t ( c INT )');
    await runTest('BOOLEAN', 'CREATE TABLE public.t ( c BOOLEAN )');
    await runTest('BOOLEAN DEFAULT', 'CREATE TABLE public.t ( c BOOLEAN DEFAULT false )');

    await pool.end();
}

run();
