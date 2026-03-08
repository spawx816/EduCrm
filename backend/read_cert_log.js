const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "Arrd1227" | sudo -S cat /var/log/letsencrypt/letsencrypt.log | tail -n 60 > /home/deploy/certbot_err.log;
        cat /home/deploy/certbot_err.log;
    `;
    conn.exec(cmd, { pty: true }, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            console.log(output);
            conn.end();
        }).on('data', (data) => {
            output += data.toString();
        }).stderr.on('data', (data) => {
            output += data.toString();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
