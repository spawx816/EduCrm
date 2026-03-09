const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const cmd = "grep -A 10 \"allScores\" /home/deploy/apps/EduCrm/frontend/src/pages/PortalMain.tsx";
    conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', (d) => out += d);
        stream.on('close', () => {
            console.log(out);
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
