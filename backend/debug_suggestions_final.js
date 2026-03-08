const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'educrm',
    password: 'Arrd1227',
    port: 5432,
});

async function debug() {
    const studentName = 'Dionisio';
    const sRes = await pool.query("SELECT id FROM students WHERE first_name ILIKE $1 LIMIT 1", ['%' + studentName + '%']);
    if (sRes.rows.length === 0) { console.log('Student not found'); await pool.end(); return; }

    const studentId = sRes.rows[0].id;
    console.log('DEBUG FOR STUDENT:', studentId);

    const enrollmentRes = await pool.query(
        "SELECT e.cohort_id, c.program_id, c.requires_enrollment FROM enrollments e JOIN academic_cohorts c ON e.cohort_id = c.id WHERE e.student_id = $1 AND e.status = 'ACTIVE' LIMIT 1",
        [studentId]
    );

    if (enrollmentRes.rows.length === 0) {
        console.log('No active enrollment found');
        await pool.end();
        return;
    }

    const { program_id, requires_enrollment } = enrollmentRes.rows[0];
    console.log('PROGRAM ID:', program_id);
    console.log('REQUIRES ENROLLMENT:', requires_enrollment);

    const modulesRes = await pool.query(
        "SELECT id, name, order_index FROM academic_modules WHERE program_id = $1 AND deleted_at IS NULL ORDER BY order_index ASC",
        [program_id]
    );
    const modules = modulesRes.rows;
    console.log('AVAILABLE MODULES:', JSON.stringify(modules, null, 2));

    const invoicedModulesRes = await pool.query(
        "SELECT id.description FROM invoice_details id JOIN invoices i ON id.invoice_id = i.id WHERE i.student_id = $1 AND i.status != 'VOIDED' AND id.item_id IS NULL AND id.description NOT ILIKE '%Inscripción%'",
        [studentId]
    );
    const invoicedNames = invoicedModulesRes.rows.map(r => r.description.toLowerCase());
    console.log('INVOICED NAMES:', JSON.stringify(invoicedNames, null, 2));

    const suggestedModuleData = modules.find(m =>
        !invoicedNames.some(name => name.includes(m.name.toLowerCase()))
    );
    console.log('SUGGESTED:', JSON.stringify(suggestedModuleData, null, 2));

    await pool.end();
}
debug().catch(console.error);
