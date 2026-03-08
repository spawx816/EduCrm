const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // List all programs and ALL modules for EACH
    const query = `
        SELECT p.id as prog_id, p.name as prog_name, am.id as mod_id, am.name as mod_name 
        FROM academic_programs p 
        LEFT JOIN academic_modules am ON am.program_id = p.id 
        ORDER BY p.name, am.name;
    `;
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
