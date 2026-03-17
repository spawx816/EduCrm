const { Pool } = require('pg');
const connectionString = "postgresql://postgres:postgres@localhost:5432/educrm";
const pool = new Pool({ connectionString });

async function debug() {
  try {
    const res = await pool.query("SELECT id, name FROM academic_programs WHERE name ILIKE '%AERO%'");
    console.log("LOCAL DB - Programs:");
    console.log(JSON.stringify(res.rows, null, 2));
    
    for (const prog of res.rows) {
        const modules = await pool.query("SELECT id, name FROM academic_modules WHERE program_id = $1", [prog.id]);
        console.log(`Program ${prog.name} has modules: ${JSON.stringify(modules.rows)}`);
        for (const mod of modules.rows) {
            const types = await pool.query("SELECT name, weight FROM grade_types WHERE module_id = $1", [mod.id]);
            console.log(`  Module ${mod.name} has types: ${JSON.stringify(types.rows)}`);
        }
    }
  } catch (err) {
    console.log("No local DB or connection failed.");
  } finally {
    await pool.end();
  }
}
debug();
