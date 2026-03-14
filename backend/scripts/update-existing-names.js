const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public",
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('Updating existing users, students, and leads to Proper Case...');
        
        const q1 = await client.query('UPDATE users SET first_name = INITCAP(first_name), last_name = INITCAP(last_name) RETURNING id');
        console.log(`Updated ${q1.rowCount} users.`);
        
        const q2 = await client.query('UPDATE students SET first_name = INITCAP(first_name), last_name = INITCAP(last_name) RETURNING id');
        console.log(`Updated ${q2.rowCount} students.`);
        
        const q3 = await client.query('UPDATE leads SET first_name = INITCAP(first_name), last_name = INITCAP(last_name) RETURNING id');
        console.log(`Updated ${q3.rowCount} leads.`);

        const q4 = await client.query('UPDATE diplomas SET student_name = INITCAP(student_name) RETURNING id');
        console.log(`Updated ${q4.rowCount} diplomas.`);
        
        console.log('Cleanup completed successfully!');
    } catch (err) {
        console.error('Error during update:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
