const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const cmd = "tail -n 20 /home/deploy/apps/EduCrm/backend/src/exams/exams.service.ts";
    conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', (d) => out += d);
        stream.on('close', () => {
            console.log(out);
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
