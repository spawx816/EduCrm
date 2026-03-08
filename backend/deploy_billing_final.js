const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const files = [
    { local: 'd:/EduC/apps/backend/src/students/students.service.ts', remote: '/home/deploy/apps/EduCrm/backend/src/students/students.service.ts' },
    { local: 'd:/EduC/apps/backend/src/billing/billing.service.ts', remote: '/home/deploy/apps/EduCrm/backend/src/billing/billing.service.ts' },
    { local: 'd:/EduC/apps/frontend/src/components/billing/CreateInvoiceModal.tsx', remote: '/home/deploy/apps/EduCrm/frontend/src/components/billing/CreateInvoiceModal.tsx' }
];

conn.on('ready', () => {
    console.log('SSH Ready');

    async function deploy() {
        for (const file of files) {
            console.log(`Subiendo ${file.remote}...`);
            const content = fs.readFileSync(file.local, 'utf8');
            await new Promise((resolve, reject) => {
                const stream = conn.exec(`cat > ${file.remote}`, (err, stream) => {
                    if (err) return reject(err);
                    stream.on('close', resolve);
                    stream.on('data', d => console.log(d.toString()));
                });
                stream.write(content);
                stream.end();
            });
            console.log(`Verificando ${file.remote}...`);
            const remoteSize = await new Promise((resolve) => {
                conn.exec(`stat -c%s ${file.remote}`, (err, stream) => {
                    stream.on('data', d => resolve(parseInt(d.toString().trim())));
                });
            });
            const localSize = fs.statSync(file.local).size;
            if (remoteSize !== localSize) {
                console.error(`ERROR: Tamaño desigual en ${file.remote}. Local: ${localSize}, Remoto: ${remoteSize}`);
                process.exit(1);
            }
        }

        console.log('Archivos verificados. Iniciando build...');
        conn.exec(`
            cd /home/deploy/apps/EduCrm/backend && npm run build && pm2 restart educrm-api &&
            cd /home/deploy/apps/EduCrm/frontend && npm run build &&
            echo "DEPLOYMENT_DONE"
        `, (err, stream) => {
            stream.on('data', d => process.stdout.write(d.toString()));
            stream.on('stderr', d => process.stderr.write(d.toString()));
            stream.on('close', () => {
                console.log('Build terminado');
                conn.end();
            });
        });
    }

    deploy();

}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
