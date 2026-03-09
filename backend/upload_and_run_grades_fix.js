const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
conn.on('ready', () => {
    console.log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        const localPath = path.join(__dirname, 'fix_grades_constraint.sql');
        const remotePath = '/home/deploy/fix_grades_constraint.sql';

        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) throw err;
            console.log('File uploaded to VPS');

            const cmd = `PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -f ${remotePath}`;
            conn.exec(cmd, (err, stream) => {
                if (err) throw err;
                stream.on('data', (d) => process.stdout.write(d.toString()));
                stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
                stream.on('close', () => {
                    console.log('SQL commands executed');
                    conn.end();
                });
            });
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
