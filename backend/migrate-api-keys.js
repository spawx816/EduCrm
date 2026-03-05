const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Creating api_keys table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          key VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          service_name VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          last_used_at TIMESTAMPTZ
      );
    `);
        console.log('Table api_keys created successfully.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
