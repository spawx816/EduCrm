const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT c.id, c.name, p.name as program_name FROM academic_cohorts c JOIN academic_programs p ON c.program_id = p.id WHERE p.name ILIKE '%INGLES%' OR p.name ILIKE '%AGENTE%';";
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
