const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading landing.zip...');
        const localZipPath = 'C:\\\\Users\\\\Spawx\\\\.gemini\\\\antigravity\\\\scratch\\\\escuela-aviacion\\\\landing.zip';
        sftp.fastPut(localZipPath, '/home/deploy/landing.zip', (err) => {
            if (err) {
                console.error("PUT ERROR:", err);
                conn.end();
            } else {
                console.log('Successfully uploaded landing.zip');

                // Unzip and setup
                const setupCmd = `
                    echo 'Arrd1227' | sudo -S mkdir -p /var/www/enaa.com.do &&
                    echo 'Arrd1227' | sudo -S chown deploy:deploy /var/www/enaa.com.do &&
                    cd /var/www/enaa.com.do &&
                    unzip -o /home/deploy/landing.zip &&
                    npm install --omit=dev &&
                    pm2 restart landing-api || PORT=5000 pm2 start server.js --name "landing-api" &&
                    pm2 save
                `;

                conn.exec(setupCmd.trim(), { pty: true }, (err, stream) => {
                    if (err) throw err;
                    stream.on('close', (code) => {
                        console.log('Setup executed with code ' + code);
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
