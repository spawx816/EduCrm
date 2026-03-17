const { Pool } = require('pg');
const fs = require('fs');
const connectionString = "postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educRM?schema=public";
const pool = new Pool({ connectionString });

async function auditEducRM() {
  const audit = {};
  try {
    const programs = await pool.query("SELECT id, name FROM academic_programs");
    audit.programs = programs.rows;

    const gradeTypes = await pool.query(`
      SELECT gt.name, m.name as module_name, p.name as program_name, gt.weight
      FROM grade_types gt
      JOIN academic_modules m ON gt.module_id = m.id
      JOIN academic_programs p ON gt.program_id = p.id
      WHERE p.name ILIKE '%AER%'
    `);
    audit.gradeTypes = gradeTypes.rows;

    fs.writeFileSync('audit_educRM.json', JSON.stringify(audit, null, 2));
    console.log("Audit of educRM written to audit_educRM.json");

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

auditEducRM();
