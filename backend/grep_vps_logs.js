const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    conn.exec('grep "GET /billing/invoices" /home/deploy/.pm2/logs/educrm-api-out.log | tail -n 10', (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
