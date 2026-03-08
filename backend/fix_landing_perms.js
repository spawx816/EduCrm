const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "Arrd1227" | sudo -S find /var/www/enaa.com.do -type d -exec chmod 755 {} \\;
        echo "Arrd1227" | sudo -S find /var/www/enaa.com.do -type f -exec chmod 644 {} \\;
        pm2 restart landing-api
    `;
    conn.exec(cmd, { pty: true }, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Permissions fixed and PM2 restarted. Code: ' + code);
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
