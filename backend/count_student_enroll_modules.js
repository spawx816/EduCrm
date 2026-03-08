const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const studentId = 'ff5a2737-7272-49eb-8b72-23c2a688523c';
    const query = "SELECT e.id as enroll_id, p.name as program, count(am.id) as mod_count FROM enrollments e JOIN academic_cohorts c ON e.cohort_id = c.id JOIN academic_programs p ON c.program_id = p.id JOIN academic_modules am ON am.program_id = p.id WHERE e.student_id = '" + studentId + "' GROUP BY e.id, p.name";
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
