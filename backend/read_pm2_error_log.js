const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "=== PM2 ERROR LOG (last 50 lines) ===" &&
        tail -n 50 /home/deploy/.pm2/logs/educrm-api-error.log 2>/dev/null &&
        echo "=== PM2 OUT LOG (attendance related) ===" &&
        tail -n 80 /home/deploy/.pm2/logs/educrm-api-out.log 2>/dev/null | grep -i "attendance\\|error\\|Error\\|500\\|column\\|relation\\|does not exist" | tail -20
    `;
    conn.exec(cmd, { pty: false }, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
