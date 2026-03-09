const http = require('http');
// Simulate an internal request or use curl-like behavior on the VPS.
const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    // Just try to fetch student data via curl to localhost:3000 (assuming the API is on 3000)
    // Actually, I can use the existing psql to test the query directly, it's better.
    const studentId = '4fe6b0fd-3844-4ee5-9d38-06d4ca1341dc'; // From earlier check
    const query = `SELECT s.*, (SELECT json_agg(row_to_json(e_data)) FROM (SELECT e.*, c.name as cohort_name, p.name as program_name FROM enrollments e JOIN academic_cohorts c ON e.cohort_id = c.id JOIN academic_programs p ON c.program_id = p.id WHERE e.student_id = s.id) e_data) as enrollments FROM students s WHERE s.id = '${studentId}'`;
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "${query}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
