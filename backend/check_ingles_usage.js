const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // Check usage of modules in INGLES program (a86dd696-0fe9-4553-be87-d2bedafe5779)
    const query = `
        SELECT 
            am.id, 
            am.name, 
            (SELECT COUNT(*) FROM grades WHERE module_id = am.id) as grade_count,
            (SELECT COUNT(*) FROM attendance WHERE module_id = am.id) as attendance_count,
            (SELECT COUNT(*) FROM exam_assignments WHERE module_id = am.id) as exam_count
        FROM academic_modules am
        WHERE am.program_id = 'a86dd696-0fe9-4553-be87-d2bedafe5779'
        ORDER BY am.name;
    `;
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log('Usage of modules in INGLES program:');
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
