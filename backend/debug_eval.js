const { Pool } = require('pg');
const connectionString = "postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public";
const pool = new Pool({ connectionString });

async function debug() {
  try {
    const res = await pool.query(`
      SELECT p.name as program, m.name as module 
      FROM academic_modules m 
      JOIN academic_programs p ON m.program_id = p.id 
      WHERE p.name ILIKE '%AERO%' OR p.name ILIKE '%VUELO%' OR p.name ILIKE '%AEREOS%'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
debug();
