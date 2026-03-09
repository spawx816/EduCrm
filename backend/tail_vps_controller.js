const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    conn.exec('tail -n 20 /home/deploy/apps/EduCrm/backend/src/billing/billing.controller.ts', (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
