const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const files = [
    { local: 'd:/EduC/apps/backend/src/students/students.service.ts', remote: '/home/deploy/apps/EduCrm/backend/src/students/students.service.ts' },
    { local: 'd:/EduC/apps/backend/src/billing/billing.service.ts', remote: '/home/deploy/apps/EduCrm/backend/src/billing/billing.service.ts' },
    { local: 'd:/EduC/apps/frontend/src/components/billing/CreateInvoiceModal.tsx', remote: '/home/deploy/apps/EduCrm/frontend/src/components/billing/CreateInvoiceModal.tsx' }
];

conn.on('ready', () => {
    console.log('SSH Connectado');
    conn.sftp(async (err, sftp) => {
        if (err) throw err;

        for (const file of files) {
            console.log(`Subiendo ${file.local}...`);
            await new Promise((resolve, reject) => {
                sftp.fastPut(file.local, file.remote, (err) => {
                    if (err) reject(err);
                    else {
                        console.log(`Subido ${file.local}`);
                        resolve();
                    }
                });
            });
        }

        const cmd = `
            echo "Building backend..." &&
            cd /home/deploy/apps/EduCrm/backend &&
            npm run build &&
            pm2 restart educrm-api &&
            
            echo "Building frontend..." &&
            cd /home/deploy/apps/EduCrm/frontend &&
            npm run build &&
            
            echo "Deployment finished and verified!"
        `;

        conn.exec(cmd, (err, stream) => {
            if (err) throw err;
            stream.on('data', (d) => process.stdout.write(d.toString()));
            stream.on('stderr', (d) => process.stderr.write(d.toString()));
            stream.on('close', () => {
                console.log('Proceso terminado');
                conn.end();
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
