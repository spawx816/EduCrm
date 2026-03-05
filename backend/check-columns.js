require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("SELECT * FROM api_keys LIMIT 1;")
    .then(res => console.log(JSON.stringify(res.fields.map(f => f.name), null, 2)))
    .catch(console.error)
    .finally(() => pool.end());
