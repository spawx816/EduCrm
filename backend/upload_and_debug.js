const { Client } = require('ssh2');
const conn = new Client();
const fs = require('fs');

conn.on('ready', () => {
    console.log('SSH Ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        const local = 'd:/EduC/apps/backend/debug_suggestions_final.js';
        const remote = '/tmp/debug_suggestions_final.js';
        sftp.fastPut(local, remote, (err) => {
            if (err) throw err;
            console.log('File uploaded');
            conn.exec('node /tmp/debug_suggestions_final.js', (err, stream) => {
                if (err) throw err;
                stream.on('data', (d) => process.stdout.write(d.toString()));
                stream.on('stderr', (d) => process.stderr.write(d.toString()));
                stream.on('close', () => conn.end());
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
