const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading crm_update.zip...');
        const localZipPath = 'D:\\\\EduC\\\\apps\\\\frontend\\\\crm_update.zip';
        sftp.fastPut(localZipPath, '/home/deploy/crm_update.zip', (err) => {
            if (err) {
                console.error("FTP Error", err);
                conn.end();
                return;
            }
            console.log('Upload complete. Extracting CRM...');

            const setupCmd = `
                echo 'Arrd1227' | sudo -S unzip -o /home/deploy/crm_update.zip -d /home/deploy/apps/EduCrm/frontend/dist &&
                echo 'Arrd1227' | sudo -S rm /home/deploy/crm_update.zip || true
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
