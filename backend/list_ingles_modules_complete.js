const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // List ALL modules for the program ID a86dd696-0fe9-4553-be87-d2bedafe5779
    const query = `
        SELECT id, name, order_index 
        FROM academic_modules 
        WHERE program_id = 'a86dd696-0fe9-4553-be87-d2bedafe5779'
        ORDER BY order_index, name;
    `;
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log('ALL modules for Program a86dd696 (INGLES AERONAUTICO):');
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
