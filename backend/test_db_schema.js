const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public'
});

async function test() {
    try {
        const res = await pool.query(`
      SELECT to_regclass('public.exam_assignments') as exists;
    `);
        console.log(res.rows[0]);
        if (res.rows[0].exists) {
            console.log('Table exam_assignments EXISTS on 136.111.157.71');
        } else {
            console.log('Table exam_assignments DOES NOT EXIST on 136.111.157.71');
        }
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        pool.end();
    }
}

test();
