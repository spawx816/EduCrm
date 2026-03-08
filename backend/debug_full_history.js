const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const studentId = '4c1e59ec-f48c-4da7-a170-4357c91726a4';
    const query = "SELECT e.cohort_id, c.program_id, p.name as program_name, " +
        "(SELECT json_agg(m_data) FROM (" +
        "SELECT am.id, am.name, am.order_index, " +
        "(SELECT count(*) FROM grades g WHERE g.student_id = '" + studentId + "' AND g.module_id = am.id AND g.cohort_id = e.cohort_id) as grade_count " +
        "FROM academic_modules am " +
        "WHERE am.program_id = c.program_id " +
        "ORDER BY am.order_index ASC" +
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
