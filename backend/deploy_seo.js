const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading landing_seo.zip...');
        const localZipPath = 'C:\\\\Users\\\\Spawx\\\\.gemini\\\\antigravity\\\\scratch\\\\escuela-aviacion\\\\landing_seo.zip';
        sftp.fastPut(localZipPath, '/home/deploy/landing_seo.zip', (err) => {
            if (err) {
                console.error("FTP Error", err);
                conn.end();
                return;
            }
            console.log('Upload complete. Extracting...');

            const setupCmd = `
                echo 'Arrd1227' | sudo -S unzip -o /home/deploy/landing_seo.zip -d /var/www/enaa.com.do &&
                echo 'Arrd1227' | sudo -S find /var/www/enaa.com.do -type d -exec chmod 755 {} \\; &&
                echo 'Arrd1227' | sudo -S find /var/www/enaa.com.do -type f -exec chmod 644 {} \\; &&
                pm2 restart landing-api
            `;

            conn.exec(setupCmd.trim(), { pty: true }, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Extraction complete code: ' + code);
                    conn.end();
                }).on('data', (data) => process.stdout.write(data.toString()))
                    .stderr.on('data', (data) => process.stderr.write(data.toString()));
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
