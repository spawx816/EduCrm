const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public' });

async function search() {
    console.log('Searching for Johendry in users, students, and leads...');
    
    const users = await pool.query("SELECT first_name, last_name, email FROM users WHERE first_name ILIKE '%Johendry%' OR last_name ILIKE '%Johendry%'");
    console.log('Users:', users.rows);
    
    const students = await pool.query("SELECT first_name, last_name, email FROM students WHERE first_name ILIKE '%Johendry%' OR last_name ILIKE '%Johendry%'");
    console.log('Students:', students.rows);
    
    const leads = await pool.query("SELECT first_name, last_name, email FROM leads WHERE first_name ILIKE '%Johendry%' OR last_name ILIKE '%Johendry%'");
    console.log('Leads:', leads.rows);
    
    process.exit(0);
}

search().catch(e => { console.error(e); process.exit(1); });
