const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const studentId = 'ff5a2737-7272-49eb-8b72-23c2a688523c';
    const query = "SELECT json_agg(row_to_json(h)) FROM (" +
        "SELECT e.id as enrollment_id, p.name as program_name, " +
        "(SELECT json_agg(m_data) FROM (" +
        "SELECT am.name as module_name, am.program_id " +
        "FROM academic_modules am " +
        "WHERE am.program_id = c.program_id " +
        "ORDER BY am.order_index" +
        ") m_data) as modules " +
        "FROM enrollments e " +
        "JOIN academic_cohorts c ON e.cohort_id = c.id " +
        "JOIN academic_programs p ON c.program_id = p.id " +
        "WHERE e.student_id = '" + studentId + "'" +
        ") h";
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            try {
                const data = JSON.parse(output.trim());
                console.log(JSON.stringify(data, null, 2));
            } catch (e) {
                console.log("Output was not valid JSON:");
                console.log(output);
            }
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
