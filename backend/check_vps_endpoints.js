const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    conn.exec('cat /home/deploy/apps/EduCrm/backend/dist/billing/billing.controller.js', (err, stream) => {
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log('Includes voidInvoice:', output.includes('voidInvoice'));
            console.log('Includes deleteInvoice:', output.includes('deleteInvoice'));
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
