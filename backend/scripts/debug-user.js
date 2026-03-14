const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public' });
pool.query("SELECT id, first_name, last_name, email FROM users")
    .then(res => { 
        console.log(JSON.stringify(res.rows, null, 2)); 
        process.exit(0); 
    })
    .catch(e => { 
        console.error(e); 
        process.exit(1); 
    });
