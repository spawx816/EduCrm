const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public' });
pool.query(`SELECT e.* FROM enrollments e WHERE e.student_id = 'a92dc848-726a-4d28-9383-c0390d648cec'`)
  .then(res => { console.log('ROWS:', res.rows.length); pool.end(); })
  .catch(err => { console.log('ERR:', err); pool.end(); });
