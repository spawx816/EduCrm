const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const sql = `
        SELECT id, first_name, last_name FROM students WHERE matricula = '001013';
        SELECT e.cohort_id, c.name FROM enrollments e JOIN academic_cohorts c ON e.cohort_id = c.id WHERE e.student_id = (SELECT id FROM students WHERE matricula = '001013');
        SELECT at.score, at.status, ea.cohort_id, e.title as exam_title, am.name as module_name
        FROM exam_attempts at
        JOIN exam_assignments ea ON at.assignment_id = ea.id
        JOIN exams e ON ea.exam_id = e.id
        JOIN academic_modules am ON ea.module_id = am.id
        WHERE at.student_id = (SELECT id FROM students WHERE matricula = '001013');
    `;
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "${sql}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
