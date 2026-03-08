const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "=== sites-enabled ===";
        ls -la /etc/nginx/sites-enabled;
        echo "=== enaa.com.do.conf ===";
        cat /etc/nginx/sites-enabled/enaa.com.do.conf;
        echo "=== virtual.enaa.com.do.conf ===";
        cat /etc/nginx/sites-enabled/virtual.enaa.com.do.conf;
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
