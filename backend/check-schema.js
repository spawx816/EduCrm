require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='api_keys'")
    .then(res => console.log(JSON.stringify(res.rows, null, 2)))
    .catch(console.error)
    .finally(() => pool.end());
