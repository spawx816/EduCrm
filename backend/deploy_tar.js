const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const localTar = 'd:/EduC/apps/billing_fix.tar';
const remoteTarB64 = '/tmp/billing_fix.tar.b64';
const remoteDest = '/home/deploy/apps/EduCrm/';

conn.on('ready', () => {
    console.log('SSH Ready');

    const base64Content = fs.readFileSync(localTar).toString('base64');

    conn.exec(`cat > ${remoteTarB64}`, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            console.log('Base64 transferido. Extrayendo...');
            const cmd = `
                base64 -d ${remoteTarB64} > /tmp/billing_fix.tar &&
                tar -xvf /tmp/billing_fix.tar -C ${remoteDest} &&
                rm ${remoteTarB64} /tmp/billing_fix.tar &&
                echo "Extraction done. Building..." &&
                cd ${remoteDest}backend && npm run build && pm2 restart educrm-api &&
                cd ${remoteDest}frontend && npm run build &&
                echo "DEPLOY_COMPLETE"
            `;
            conn.exec(cmd, (err, stream2) => {
                stream2.on('data', d => process.stdout.write(d.toString()));
                stream2.on('stderr', d => process.stderr.write(d.toString()));
                stream2.on('close', () => {
                    console.log('Proceso terminado');
                    conn.end();
                });
            });
        });
        stream.write(base64Content);
        stream.end();
    });

}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
