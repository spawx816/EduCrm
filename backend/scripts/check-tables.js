const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public' });
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    .then(res => { 
        console.log(res.rows.map(r => r.table_name).join(', ')); 
        process.exit(0); 
    })
    .catch(e => { 
        console.error(e); 
        process.exit(1); 
    });
