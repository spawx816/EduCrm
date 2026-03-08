const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const studentId = '4c1e59ec-f48c-4da7-a170-4357c91726a4';
    const query = `
        SELECT e.id as enroll_id, p.id as prog_id, p.name as prog_name,
        (
            SELECT json_agg(m_data) FROM (
                SELECT am.id, am.name, am.program_id
                FROM academic_modules am
                WHERE am.program_id = c.program_id
            ) m_data
        ) as modules
        FROM enrollments e
        JOIN academic_cohorts c ON e.cohort_id = c.id
        JOIN academic_programs p ON c.program_id = p.id
        WHERE e.student_id = '${studentId}'
    `;
    conn.exec(\`echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "\${query}"\`, (err, stream) => {
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
