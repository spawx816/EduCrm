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

    // 1. Identify "Aerolineas" programs (be broad)
    const programs = await client.query("SELECT id, name FROM academic_programs WHERE name ILIKE '%AERO%' OR name ILIKE '%AGENTES%'");
    console.log(`Found ${programs.rows.length} relevant programs.`);

    for (const prog of programs.rows) {
      console.log(`Fixing program: ${prog.name}`);
      const modules = await client.query("SELECT id, name FROM academic_modules WHERE program_id = $1", [prog.id]);
      
      for (const mod of modules.rows) {
        console.log(`  Updating module: ${mod.name}`);
        // Remove ANY existing types to force the new ones
        await client.query("DELETE FROM grade_types WHERE module_id = $1", [mod.id]);
        
        for (const config of EVAL_CONFIG) {
          await client.query(
            "INSERT INTO grade_types (program_id, module_id, name, weight, is_individual) VALUES ($1, $2, $3, $4, $5)",
            [prog.id, mod.id, config.name, config.weight, false]
          );
        }
      }
    }

    // 2. Extra safety: Search for any module named exactly "Módulo 1" in ANY program and fix it too? 
    // Maybe best to stick to relevant programs.

    await client.query('COMMIT');
    console.log("Fix applied to all relevant programs.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Fix failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

fix();
