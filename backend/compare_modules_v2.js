const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT p.name as program, m.name as module_name, m.order_index FROM academic_modules m JOIN academic_programs p ON m.program_id = p.id WHERE p.id IN ('8ba8356d-e445-4860-9444-e5c703deb445', '89c0213d-3864-4ef6-9444-e5c703deb445', '7cf07a52-c88f-4f61-ba09-22a86dd6960f') ORDER BY p.name, m.order_index;";
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "' + query + '"', (err, stream) => {
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
