const { Client } = require('ssh2');
const conn = new Client();
const fs = require('fs');

conn.on('ready', () => {
    console.log('SSH Ready');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        const backendZip = 'd:/EduC/apps/backend_refinement.zip';
        const remoteBackendZip = '/home/deploy/backend_refinement.zip';

        console.log('Uploading zip...');
        sftp.fastPut(backendZip, remoteBackendZip, {}, (err) => {
            if (err) throw err;
            console.log('Backend zip uploaded');

            const cmd = `
                echo "Extracting backend..." &&
                unzip -o /home/deploy/backend_refinement.zip -d /home/deploy/apps/EduCrm/backend/ &&
                rm /home/deploy/backend_refinement.zip || true &&
                
                echo "Building backend..." &&
                cd /home/deploy/apps/EduCrm/backend &&
                npm run build &&
                pm2 restart educrm-api &&
                
                echo "Refinement Deployed!"
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
