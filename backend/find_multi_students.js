const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT e.student_id, s.first_name, s.last_name, count(e.id) as enroll_count FROM enrollments e JOIN students s ON e.student_id = s.id GROUP BY e.student_id, s.first_name, s.last_name HAVING count(e.id) > 1 LIMIT 10;";
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
