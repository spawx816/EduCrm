const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    conn.exec('grep -r "/home/deploy/apps/EduCrm/frontend" /etc/nginx/', (err, stream) => {
        stream.on('data', d => process.stdout.write(d));
        stream.on('stderr', d => process.stderr.write(d));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'root', password: 'mCiqhu2nqLDi' });
