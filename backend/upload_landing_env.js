const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading .env...');
        const localEnvPath = 'C:\\\\Users\\\\Spawx\\\\.gemini\\\\antigravity\\\\scratch\\\\escuela-aviacion\\\\.env';
        sftp.fastPut(localEnvPath, '/var/www/enaa.com.do/.env', (err) => {
            if (err) {
                console.error("PUT ERROR:", err);
                conn.end();
            } else {
                console.log('Successfully uploaded .env');

                // Restart PM2
                const restartCmd = `cd /var/www/enaa.com.do && pm2 restart landing-api`;

                conn.exec(restartCmd, { pty: true }, (err, stream) => {
                    if (err) throw err;
                    stream.on('close', (code) => {
                        console.log('PM2 restarted with code ' + code);
                        conn.end();
                    }).on('data', (data) => {
                        console.log(data.toString());
                    }).stderr.on('data', (data) => console.log(data.toString()));
                });
            }
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
