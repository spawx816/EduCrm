const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    const sql = `
        SELECT m.id, m.name, m.order_index
        FROM academic_modules m
        JOIN academic_programs p ON m.program_id = p.id
        JOIN academic_cohorts c ON p.id = c.program_id
        JOIN enrollments e ON c.id = e.cohort_id
        JOIN students s ON e.student_id = s.id
        WHERE s.first_name ILIKE '%Dionisio%' AND s.last_name ILIKE '%Ramirez%'
        ORDER BY m.order_index ASC;
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
