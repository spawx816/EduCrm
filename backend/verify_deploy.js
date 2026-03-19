const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    conn.exec(`npm run build --prefix /home/deploy/apps/EduCrm/backend && chown -R deploy:deploy /home/deploy/apps/EduCrm/backend/dist && sudo -u deploy bash -c 'pm2 restart educrm-api'`, (err, stream) => {
        stream.on('data', d => process.stdout.write(d));
        stream.on('stderr', d => process.stderr.write(d));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'root', password: 'mCiqhu2nqLDi' });
