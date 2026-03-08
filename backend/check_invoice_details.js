const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    const sql = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoice_details';";
    const cmd = `echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${sql}"`;

    conn.exec(cmd, (err, stream) => {
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
