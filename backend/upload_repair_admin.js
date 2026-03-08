const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;
        console.log('Uploading remote_repair_admin.js...');
        sftp.fastPut('./remote_repair_admin.js', '/home/deploy/apps/EduCrm/backend/remote_repair_admin.js', (err) => {
            if (err) throw err;
            console.log('Successfully uploaded script');
            conn.exec('cd /home/deploy/apps/EduCrm/backend && node remote_repair_admin.js', { pty: true }, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Script executed with code ' + code);
                    conn.end();
                }).on('data', (data) => {
                    console.log(data.toString());
                }).stderr.on('data', (data) => console.log(data.toString()));
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
