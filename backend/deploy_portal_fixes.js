const { Client } = require('ssh2');
const conn = new Client();
const fs = require('fs');

conn.on('ready', () => {
    console.log('SSH Ready');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        const backendZip = 'd:/EduC/apps/backend/backend_portal_fix.zip';
        const frontendZip = 'd:/EduC/apps/frontend/frontend_portal_fix.zip';

        console.log('Uploading backends...');
        sftp.fastPut(backendZip, '/home/deploy/backend_portal_fix.zip', {}, (err) => {
            if (err) throw err;
            console.log('Backend uploaded');

            sftp.fastPut(frontendZip, '/home/deploy/frontend_portal_fix.zip', {}, (err) => {
                if (err) throw err;
                console.log('Frontend uploaded');

                const cmd = `
                    echo "Extracting backend..." &&
                    unzip -o /home/deploy/backend_portal_fix.zip -d /home/deploy/apps/EduCrm/backend/ &&
                    
                    echo "Extracting frontend..." &&
                    unzip -o /home/deploy/frontend_portal_fix.zip -d /home/deploy/apps/EduCrm/frontend/ &&
                    
                    rm /home/deploy/backend_portal_fix.zip &&
                    rm /home/deploy/frontend_portal_fix.zip &&
                    
                    echo "Building backend..." &&
                    cd /home/deploy/apps/EduCrm/backend &&
                    npm run build &&
                    pm2 restart educrm-api &&
                    
                    echo "Building frontend..." &&
                    cd /home/deploy/apps/EduCrm/frontend &&
                    npm run build &&
                    
                    echo "Portal Fixes Deployed!"
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
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
