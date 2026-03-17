const { Pool } = require('pg');
const connectionString = "postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public";
const pool = new Pool({ connectionString });

const EVAL_CONFIG = [
  { name: 'Asistencia', weight: 0.10 },
  { name: 'Careo', weight: 0.25 },
  { name: 'Exposicion', weight: 0.25 },
  { name: 'Examenes', weight: 0.40 }
];

async function fix() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find ALL programs that could possibly be what the user wants
    const programs = await client.query(`
      SELECT id, name FROM academic_programs 
      WHERE name ILIKE '%AERO%' 
         OR name ILIKE '%AGENTES%' 
         OR name ILIKE '%VUELO%' 
         OR name ILIKE '%AEREOS%'
    `);
    console.log(`Fixing ${programs.rows.length} programs: ${programs.rows.map(p => p.name).join(', ')}`);

    for (const prog of programs.rows) {
      const modules = await client.query("SELECT id, name FROM academic_modules WHERE program_id = $1", [prog.id]);
      for (const mod of modules.rows) {
        // Clear everything
        await client.query("DELETE FROM grades WHERE module_id = $1", [mod.id]);
        await client.query("DELETE FROM grade_types WHERE module_id = $1", [mod.id]);
        
        for (const config of EVAL_CONFIG) {
          await client.query(
            "INSERT INTO grade_types (program_id, module_id, name, weight, is_individual) VALUES ($1, $2, $3, $4, $5)",
            [prog.id, mod.id, config.name, config.weight, false]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log("Success.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}
fix();
