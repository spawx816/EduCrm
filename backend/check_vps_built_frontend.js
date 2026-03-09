const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    // Search for "filteredExams" or unique strings in the built JS
    const cmd = "grep -r \"filteredExams\" /home/deploy/apps/EduCrm/frontend/dist/assets/";
    conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', (d) => out += d);
        stream.on('close', () => {
            console.log(out);
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
