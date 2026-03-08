const { Client } = require('ssh2');
const conn = new Client();
const fs = require('fs');
const path = require('path');

conn.on('ready', () => {
    console.log('SSH Ready');

    // Upload frontend zip
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const frontendZip = 'd:/EduC/apps/frontend_update.zip';
        const remoteZip = '/home/deploy/frontend_update.zip';

        console.log('Uploading frontend zip...');
        sftp.fastPut(frontendZip, remoteZip, {}, (err) => {
            if (err) throw err;
            console.log('Frontend zip uploaded');

            const cmd = `
                echo 'Arrd1227' | sudo -S chown -R deploy:deploy /home/deploy/apps/EduCrm &&
                unzip -o /home/deploy/frontend_update.zip -d /home/deploy/apps/EduCrm/frontend/ &&
                rm /home/deploy/frontend_update.zip || true &&
                cd /home/deploy/apps/EduCrm/frontend &&
                npm run build &&
                echo 'Arrd1227' | sudo -S systemctl restart nginx
            `;

            conn.exec(cmd, { pty: true }, (err, stream) => {
                if (err) throw err;
                stream.on('data', (d) => process.stdout.write(d.toString()));
                stream.on('stderr', (d) => process.stderr.write(d.toString()));
                stream.on('close', (code) => {
                    console.log('\nDeployment finished with code:', code);
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
