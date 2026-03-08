const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // Query to see programs and their modules to detect overlaps
    const query = `
        SELECT p.id as prog_id, p.name as prog_name, am.id as mod_id, am.name as mod_name 
        FROM academic_programs p 
        JOIN academic_modules am ON am.program_id = p.id 
        WHERE p.name ILIKE '%INGLES%' OR p.name ILIKE '%AGENTE%'
        ORDER BY p.name, am.order_index;
    `;
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('stderr', (d) => console.error('STDERR:', d.toString()));
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
