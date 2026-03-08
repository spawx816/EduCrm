const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // Delete modules named 'Modulo %' from program a86dd696-0fe9-4553-be87-d2bedafe5779
    const query = `
        DELETE FROM academic_modules 
        WHERE program_id = 'a86dd696-0fe9-4553-be87-d2bedafe5779' 
        AND name ILIKE 'Modulo %'
        AND id NOT IN (SELECT module_id FROM grades)
        AND id NOT IN (SELECT module_id FROM attendance)
        AND id NOT IN (SELECT module_id FROM exam_assignments)
        RETURNING id, name;
    `;
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log('Deleted modules from INGLES program:');
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
