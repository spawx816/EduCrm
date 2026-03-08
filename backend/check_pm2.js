const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    conn.exec('pm2 list > pm2_list.txt && cat pm2_list.txt', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
            conn.end();
        }).on('data', (data) => process.stdout.write(data.toString()))
            .stderr.on('data', (data) => process.stderr.write(data.toString()));
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
