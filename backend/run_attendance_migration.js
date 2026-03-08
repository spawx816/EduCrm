const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready - Uploading SQL migration');

    conn.sftp((err, sftp) => {
        if (err) { console.error('SFTP error:', err); conn.end(); return; }

        const localFile = 'd:/EduC/apps/fix_attendance_constraint.sql';
        const remoteFile = '/tmp/fix_attendance_constraint.sql';

        sftp.fastPut(localFile, remoteFile, {}, (uploadErr) => {
            if (uploadErr) { console.error('Upload error:', uploadErr); conn.end(); return; }
            console.log('SQL file uploaded');

            const cmd = `PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -f /tmp/fix_attendance_constraint.sql 2>&1`;

            conn.exec(cmd, { pty: true }, (execErr, stream) => {
                if (execErr) { console.error(execErr); conn.end(); return; }
                stream.on('data', (d) => process.stdout.write(d.toString()));
                stream.on('stderr', (d) => process.stderr.write(d.toString()));
                stream.on('close', (code) => {
                    console.log('\nMigration finished with code:', code);
                    conn.end();
                });
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
