const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT m.id, m.name, p.name as program_name, m.program_id FROM academic_modules m JOIN academic_programs p ON m.program_id = p.id WHERE m.name = 'Mensualidad 1' OR m.name = 'Modulo 1' ORDER BY m.name, p.name";
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
