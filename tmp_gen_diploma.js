const { Pool } = require('pg');

async function run() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'educrm',
    port: 5432,
  });

  const studentId = 'feaef9d4-e0f9-4ae8-98cb-7b648d588edc';
  const invoiceNumber = 'INV-42698274';

  try {
    const invRes = await pool.query('SELECT id FROM invoices WHERE invoice_number = $1', [invoiceNumber]);
    if (invRes.rows.length === 0) {
      console.log('Invoice not found');
      return;
    }
    const invoiceId = invRes.rows[0].id;

    // Get student info
    const studentRes = await pool.query(
        `SELECT s.id, s.first_name, s.last_name, p.name as program_name 
         FROM students s
         JOIN enrollments e ON s.id = e.student_id
         JOIN academic_cohorts c ON e.cohort_id = c.id
         JOIN academic_programs p ON c.program_id = p.id
         WHERE s.id = $1
         ORDER BY e.created_at DESC
         LIMIT 1`,
        [studentId]
    );

    if (studentRes.rows.length === 0) {
      console.log('Enrollment not found');
      return;
    }

    const student = studentRes.rows[0];
    const studentName = `${student.first_name} ${student.last_name}`.toUpperCase();
    const courseName = student.program_name;

    await pool.query(
        `INSERT INTO diplomas (student_id, invoice_id, student_name, course_name)
         VALUES ($1, $2, $3, $4)`,
        [studentId, invoiceId, studentName, courseName]
    );

    console.log('Diploma generated successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
