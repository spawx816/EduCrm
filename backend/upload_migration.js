const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading combined_migration.sql...');
        sftp.fastPut('./combined_migration.sql', '/home/deploy/combined_migration.sql', (err) => {
            if (err) throw err;
            console.log('Successfully uploaded migration script');

            const cmd = "PGPASSWORD='EducrmSecurePass2026!' psql -h localhost -U educrm_user -d educrm -f /home/deploy/combined_migration.sql";

            conn.exec(cmd, { pty: true }, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Migration executed with code ' + code);
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
