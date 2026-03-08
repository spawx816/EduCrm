const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const studentId = 'ff5a2737-7272-49eb-8b72-23c2a688523c';
    const query = "SELECT e.id as enrollment_id, p.name as program_name, " +
        "(SELECT json_agg(m_data) FROM (" +
        "SELECT am.name as module_name, am.program_id as module_program_id " +
        "FROM academic_modules am " +
        "WHERE am.program_id = c.program_id " +
        "ORDER BY am.order_index" +
        ") m_data) as modules " +
        "FROM enrollments e " +
        "JOIN academic_cohorts c ON e.cohort_id = c.id " +
        "JOIN academic_programs p ON c.program_id = p.id " +
        "WHERE e.student_id = '" + studentId + "'";
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
