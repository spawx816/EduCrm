const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const localBackendPath = 'd:/EduC/apps/backend/src/billing/billing.service.ts';
const localFrontendPath = 'd:/EduC/apps/frontend/src/components/billing/CreateInvoiceModal.tsx';

const remoteBackendPath = '/home/deploy/apps/EduCrm/backend/src/billing/billing.service.ts';
const remoteFrontendPath = '/home/deploy/apps/EduCrm/frontend/src/components/billing/CreateInvoiceModal.tsx';

conn.on('ready', () => {
    console.log('SSH Connectado');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Subiendo Backend...');
        sftp.fastPut(localBackendPath, remoteBackendPath, (err) => {
            if (err) {
                console.error('Error subiendo backend:', err);
                conn.end();
                return;
            }
            console.log('Backend subido');

            console.log('Subiendo Frontend...');
            sftp.fastPut(localFrontendPath, remoteFrontendPath, (err) => {
                if (err) {
                    console.error('Error subiendo frontend:', err);
                    conn.end();
                    return;
                }
                console.log('Frontend subido');

                const cmd = `
                    echo "Building backend..." &&
                    cd /home/deploy/apps/EduCrm/backend &&
                    npm run build &&
                    pm2 restart educrm-api &&
                    
                    echo "Building frontend..." &&
                    cd /home/deploy/apps/EduCrm/frontend &&
                    npm run build &&
                    
                    echo "Billing Selection Fixes Deployed!"
                `;

                conn.exec(cmd, (err, stream) => {
                    if (err) throw err;
                    stream.on('data', (d) => process.stdout.write(d.toString()));
                    stream.on('stderr', (d) => process.stderr.write(d.toString()));
                    stream.on('close', () => {
                        console.log('Despliegue completado');
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
