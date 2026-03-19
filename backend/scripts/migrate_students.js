const mysql = require('mysql2/promise');
const { Client } = require('pg');

async function migrate() {
  console.log('--- Iniciando Migración de Estudiantes ---');
  
  const mysqlConfig = {
    host: '136.111.157.71',
    user: 'rpg',
    password: 'Arrd1227@',
    database: 'enaa_facturacion',
    port: 3306
  };

  const pgConfig = {
    connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
  };

  const mysqlConn = await mysql.createConnection(mysqlConfig);
  const pgClient = new Client(pgConfig);

  try {
    await pgClient.connect();
    console.log('✅ Conectado a PostgreSQL y MySQL');

    // 1. Obtener o Crear Programa "MIGRACIÓN"
    let programRes = await pgClient.query("SELECT id FROM academic_programs WHERE name = 'MIGRACIÓN'");
    let programId;
    if (programRes.rows.length === 0) {
      const insProg = await pgClient.query("INSERT INTO academic_programs (id, name, description, code) VALUES (gen_random_uuid(), 'MIGRACIÓN', 'Estudiantes migrados de sistema anterior', 'MIGR') RETURNING id");
      programId = insProg.rows[0].id;
      console.log('📂 Programa MIGRACIÓN creado.');
    } else {
      programId = programRes.rows[0].id;
      console.log('📂 Programa MIGRACIÓN ya existe.');
    }

    // 2. Obtener o Crear Cohorte "Migración"
    let cohortRes = await pgClient.query("SELECT id FROM academic_cohorts WHERE name = 'Migración' AND program_id = $1", [programId]);
    let cohortId;
    if (cohortRes.rows.length === 0) {
      const insCohort = await pgClient.query(
        "INSERT INTO academic_cohorts (id, program_id, name, start_date) VALUES (gen_random_uuid(), $1, 'Migración', NOW()) RETURNING id", 
        [programId]
      );
      cohortId = insCohort.rows[0].id;
      console.log('👥 Cohorte Migración creado.');
    } else {
      cohortId = cohortRes.rows[0].id;
      console.log('👥 Cohorte Migración ya existe.');
    }

    // 3. Obtener Estudiantes de MySQL
    console.log('📥 Obteniendo estudiantes de MySQL...');
    const [students] = await mysqlConn.query(`
      SELECT id, cedula, nombre_completo, correo, telefono, direccion
      FROM alumnos 
      WHERE activo = 1
    `);

    console.log(`📊 Se encontraron ${students.length} estudiantes activos para migrar.`);

    let successCount = 0;
    let skipCount = 0;

    for (const s of students) {
      const fullName = (s.nombre_completo || '').trim();
      if (!fullName) continue;

      const parts = fullName.split(' ');
      const first_name = parts[0] || 'Estudiante';
      const last_name = parts.slice(1).join(' ') || 'Migrado';
      
      const email = s.correo ? s.correo.trim().toLowerCase() : `migrado_${s.id}@enaa.com.do`;
      const phone = (s.telefono || '').trim();
      const document_id = s.cedula ? s.cedula.trim() : null;
      const address = (s.direccion || '').trim();

      try {
        // Verificar si existe por document_id o correo
        const existRes = await pgClient.query(
          "SELECT id FROM students WHERE (document_id = $1 AND $1 IS NOT NULL) OR email = $2", 
          [document_id, email]
        );
        
        let studentId;
        if (existRes.rows.length === 0) {
           // Generar matricula simple para migrados si no es automatica
           const matriculaRes = await pgClient.query("SELECT nextval('student_matricula_seq')");
           const nextVal = matriculaRes.rows[0].nextval;
           const formattedMatricula = String(nextVal).padStart(6, '0');

           const insStudent = await pgClient.query(
             `INSERT INTO students (id, first_name, last_name, email, phone, document_type, document_id, address, status, matricula) 
              VALUES (gen_random_uuid(), $1, $2, $3, $4, 'CEDULA', $5, $6, 'active', $7) 
              RETURNING id`,
             [first_name, last_name, email, phone, document_id, address, formattedMatricula]
           );
           studentId = insStudent.rows[0].id;
           successCount++;
        } else {
           studentId = existRes.rows[0].id;
           skipCount++;
        }

        // Inscribir en el Cohorte de Migración
        const enrollRes = await pgClient.query(
          "SELECT id FROM enrollments WHERE student_id = $1 AND cohort_id = $2", 
          [studentId, cohortId]
        );
        
        if (enrollRes.rows.length === 0) {
          await pgClient.query(
            "INSERT INTO enrollments (id, student_id, cohort_id, status, enrollment_date) VALUES (gen_random_uuid(), $1, $2, 'active', NOW())", 
            [studentId, cohortId]
          );
        }

      } catch (err) {
        console.error(`❌ Error con ${fullName}: ${err.message}`);
      }
    }

    console.log('\n--- Resumen ---');
    console.log(`✅ Nuevos estudiantes: ${successCount}`);
    console.log(`⏭️ Estudiantes ya existentes: ${skipCount}`);
    console.log('🏁 Migración finalizada.');

  } catch (err) {
    console.error('💥 Error crítico en la migración:', err);
  } finally {
    await mysqlConn.end();
    await pgClient.end();
  }
}

migrate();
