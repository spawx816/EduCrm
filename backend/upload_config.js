const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading modified config...');
        sftp.fastPut('./enaa.com.do.conf', '/home/deploy/enaa.com.do.conf', (err) => {
            if (err) throw err;
            console.log('Successfully uploaded config to /home/deploy');

            const cmd = "echo 'Arrd1227' | sudo -S mv /home/deploy/enaa.com.do.conf /etc/nginx/sites-available/enaa.com.do.conf && echo 'Arrd1227' | sudo -S nginx -t && echo 'Arrd1227' | sudo -S systemctl reload nginx";

            conn.exec(cmd, { pty: true }, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Nginx config updated and reloaded with code ' + code);
                    conn.end();
                }).on('data', (data) => {
                    const output = data.toString();
                    process.stdout.write(output);
                    if (output.includes('[sudo] password for deploy:')) {
                        stream.write('Arrd1227\n');
                    }
                }).stderr.on('data', (data) => console.log(data.toString()));
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
