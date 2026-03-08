const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) { console.error(err); conn.end(); return; }

        const localFile = 'd:/EduC/apps/backend/fix_attendance_final.sql';
        const remoteFile = '/tmp/fix_attendance_final.sql';

        sftp.fastPut(localFile, remoteFile, {}, (uploadErr) => {
            if (uploadErr) { console.error(uploadErr); conn.end(); return; }
            console.log('SQL file uploaded');

            // Execute with sudo
            const cmd = `echo "Arrd1227" | sudo -S -u postgres psql -d educrm -f /tmp/fix_attendance_final.sql`;
            conn.exec(cmd, { pty: true }, (execErr, stream) => {
                stream.on('data', (d) => process.stdout.write(d.toString()));
                stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
                stream.on('close', () => conn.end());
            });
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
