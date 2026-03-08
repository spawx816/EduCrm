const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // List ALL modules with name 'Modulo %' or 'Módulo %' or 'Mensualidad %' 
    // and see which program they are in.
    const query = `
        SELECT am.id, am.name, p.name as program_name, p.id as program_id
        FROM academic_modules am
        JOIN academic_programs p ON am.program_id = p.id
        WHERE am.name ILIKE 'Modulo %' OR am.name ILIKE 'Módulo %' OR am.name ILIKE 'Mensualidad %'
        ORDER BY am.name, p.name;
    `;
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log('Detailed Module-Program Alignment:');
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
