const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    // We'll capture BOTH error and out logs to be sure.
    const cmd = 'tail -n 100 /home/deploy/.pm2/logs/educrm-api-error.log && echo "--- OUT LOG ---" && tail -n 100 /home/deploy/.pm2/logs/educrm-api-out.log';
    conn.exec(cmd, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        let output = '';
        stream.on('data', (d) => output += d);
        stream.stderr.on('data', (d) => output += d);
        stream.on('close', () => {
            fs.writeFileSync('d:/EduC/apps/backend/full_vps_logs.log', output);
            console.log('Logs saved to d:/EduC/apps/backend/full_vps_logs.log');
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
