const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const localBackendPath = 'd:/EduC/apps/backend/src/billing/billing.service.ts';
const localFrontendPath = 'd:/EduC/apps/frontend/src/components/billing/CreateInvoiceModal.tsx';

const remoteBackendPath = '/home/deploy/educ/apps/backend/src/billing/billing.service.ts';
const remoteFrontendPath = '/home/deploy/educ/apps/frontend/src/components/billing/CreateInvoiceModal.tsx';

conn.on('ready', () => {
    console.log('SSH Connectado');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        // Upload Backend
        sftp.fastPut(localBackendPath, remoteBackendPath, (err) => {
            if (err) throw err;
            console.log('Backend subido');

            // Upload Frontend
            sftp.fastPut(localFrontendPath, remoteFrontendPath, (err) => {
                if (err) throw err;
                console.log('Frontend subido');

                // Build and Restart
                conn.exec('cd /home/deploy/educ/apps/backend && npm run build && pm2 restart all && cd /home/deploy/educ/apps/frontend && npm run build', (err, stream) => {
                    if (err) throw err;
                    stream.on('data', (d) => console.log(d.toString()));
                    stream.on('stderr', (d) => console.error(d.toString()));
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
