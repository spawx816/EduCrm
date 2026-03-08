const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    const sql = `
        SELECT e.status as enrollment_status, c.requires_enrollment, c.name as cohort_name
        FROM students s
        JOIN enrollments e ON s.id = e.student_id
        JOIN academic_cohorts c ON e.cohort_id = c.id
        WHERE s.first_name ILIKE '%Dionisio%' AND s.last_name ILIKE '%Ramirez%';
    `;
    const cmd = `echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${sql}"`;

    conn.exec(cmd, (err, stream) => {
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
