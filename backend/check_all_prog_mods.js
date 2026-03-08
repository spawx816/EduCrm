const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT p.name as prog_name, count(m.id) as mod_count FROM academic_programs p LEFT JOIN academic_modules m ON p.id = m.program_id GROUP BY p.name ORDER BY p.name";
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
