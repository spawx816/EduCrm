const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        const remotePath = '/home/deploy/apps/EduCrm/backend/src/billing/billing.service.ts';
        sftp.readFile(remotePath, 'utf8', (err, data) => {
            if (err) throw err;
            console.log(data);
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
