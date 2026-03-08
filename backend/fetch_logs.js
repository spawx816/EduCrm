const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;
        console.log('Downloading educrm-api-error.log...');
        sftp.fastGet('/home/deploy/.pm2/logs/educrm-api-error.log', './educrm-api-error.log', (err) => {
            if (err) console.log(err); else console.log('Downloaded error log');
            console.log('Downloading educrm-api-out.log...');
            sftp.fastGet('/home/deploy/.pm2/logs/educrm-api-out.log', './educrm-api-out.log', (err) => {
                if (err) console.log(err); else console.log('Downloaded out log');
                conn.end();
            });
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
