const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    conn.exec('echo "Arrd1227" | sudo -S systemctl status nginx --no-pager > /home/deploy/nginx_status.txt && pm2 status > /home/deploy/pm2_status.txt && cat /home/deploy/nginx_status.txt && echo "=== PM2 ===" && cat /home/deploy/pm2_status.txt', { pty: true }, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
            process.stderr.write(data.toString());
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
