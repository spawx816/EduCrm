const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // Check if 'Módulo' modules are linked to INGLES program ID
    const query = `
        SELECT am.id, am.name, p.name as program_name 
        FROM academic_modules am
        JOIN academic_programs p ON am.program_id = p.id
        WHERE am.program_id = 'a86dd696-0fe9-4553-be87-d2bedafe5779'
        AND am.name ILIKE '%Módulo%';
    `;
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log('Results for INGLES program ID and "Módulo" name:');
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
