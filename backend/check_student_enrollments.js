const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT e.id, p.name as program_name, c.name as cohort_name FROM enrollments e JOIN academic_cohorts c ON e.cohort_id = c.id JOIN academic_programs p ON c.program_id = p.id WHERE e.student_id = 'ff5a2737-7272-49eb-8b72-23c2a688523c';";
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log(output);
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
