const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const cmd = "grep -C 5 \"getStudentAttempts\" /home/deploy/apps/EduCrm/backend/dist/exams/exams.service.js";
    conn.exec(cmd, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
