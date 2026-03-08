const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading update_ws.zip...');
        const localZipPath = 'C:\\\\Users\\\\Spawx\\\\.gemini\\\\antigravity\\\\scratch\\\\escuela-aviacion\\\\update_ws.zip';
        sftp.fastPut(localZipPath, '/home/deploy/update_ws.zip', (err) => {
            if (err) {
                console.error("FTP Error", err);
                conn.end();
                return;
            }
            console.log('Upload complete. Extracting...');

            const setupCmd = `
                echo 'Arrd1227' | sudo -S unzip -o /home/deploy/update_ws.zip -d /var/www/enaa.com.do/dist &&
                echo 'Arrd1227' | sudo -S rm /home/deploy/update_ws.zip || true &&
                echo 'Arrd1227' | sudo -S find /var/www/enaa.com.do/dist -type f -exec chmod 644 {} \\;
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
