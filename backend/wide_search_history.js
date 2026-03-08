const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT s.first_name, s.last_name, e.id as enroll_id, p.name as program, count(am.id) as mod_count FROM students s JOIN enrollments e ON s.id = e.student_id JOIN academic_cohorts c ON e.cohort_id = c.id JOIN academic_programs p ON c.program_id = p.id JOIN academic_modules am ON am.program_id = p.id WHERE s.id IN (SELECT student_id FROM enrollments e2 JOIN academic_cohorts c2 ON e2.cohort_id = c2.id JOIN academic_programs p2 ON c2.program_id = p2.id WHERE p2.name ILIKE '%INGLES%') AND s.id IN (SELECT student_id FROM enrollments e3 JOIN academic_cohorts c3 ON e3.cohort_id = c3.id JOIN academic_programs p3 ON c3.program_id = p3.id WHERE p3.name ILIKE '%AGENTE%') GROUP BY s.first_name, s.last_name, e.id, p.name ORDER BY s.last_name, p.name;";
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log(output.trim());
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
