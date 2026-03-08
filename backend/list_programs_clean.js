const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "SELECT id, name FROM academic_programs"', (err, stream) => {
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
