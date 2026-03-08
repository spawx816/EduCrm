const { Client } = require('ssh2');
const conn = new Client();
const fs = require('fs');

conn.on('ready', () => {
    console.log('SSH Ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        const remote = '/tmp/iga_modules.json';
        const local = 'd:/EduC/apps/backend/iga_modules.json';
        sftp.fastGet(remote, local, (err) => {
            if (err) throw err;
            console.log('File downloaded to ' + local);
            conn.end();
            const data = fs.readFileSync(local, 'utf8');
            console.log('--- CONTENT ---');
            console.log(data);
            console.log('---------------');
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
