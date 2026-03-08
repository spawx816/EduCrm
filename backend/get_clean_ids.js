const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT s.id FROM students s WHERE s.id IN (SELECT student_id FROM enrollments e JOIN academic_cohorts c ON e.cohort_id = c.id JOIN academic_programs p ON c.program_id = p.id WHERE p.name ILIKE '%INGLES%') AND s.id IN (SELECT student_id FROM enrollments e JOIN academic_cohorts c ON e.cohort_id = c.id JOIN academic_programs p ON c.program_id = p.id WHERE p.name ILIKE '%AGENTE%') LIMIT 5;";
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
