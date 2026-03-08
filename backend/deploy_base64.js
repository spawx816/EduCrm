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

    let currentFileIndex = 0;

    function uploadNext() {
        if (currentFileIndex >= files.length) {
            console.log('Todos los archivos subidos. Iniciando build...');
            startBuild();
            return;
        }

        const file = files[currentFileIndex];
        const base64 = fs.readFileSync(file.local).toString('base64');
        const remoteTemp = `/tmp/transfer_${currentFileIndex}.b64`;

        console.log(`Subiendo ${file.local} via base64...`);

        conn.exec(`cat > ${remoteTemp}`, (err, stream) => {
            if (err) throw err;
            stream.on('close', () => {
                conn.exec(`base64 -d ${remoteTemp} > ${file.remote} && rm ${remoteTemp}`, (err, stream2) => {
                    if (err) throw err;
                    stream2.on('close', () => {
                        console.log(`Finalizado: ${file.remote}`);
                        currentFileIndex++;
                        uploadNext();
                    });
                    stream2.on('data', d => console.log(d.toString()));
                });
            });
            stream.write(base64);
            stream.end();
        });
    }

    function startBuild() {
        const cmd = `
            echo "Building backend..." &&
            cd /home/deploy/apps/EduCrm/backend &&
            npm run build &&
            pm2 restart educrm-api &&
            
            echo "Building frontend..." &&
            cd /home/deploy/apps/EduCrm/frontend &&
            npm run build &&
            
            echo "Despliegue final exitoso!"
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
    }

    uploadNext();

}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
