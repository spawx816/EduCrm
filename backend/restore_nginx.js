const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Restoring virtual.enaa.com.do Nginx config...');
        sftp.fastPut('./enaa.com.do.conf', '/home/deploy/virtual.enaa.com.do.conf', (err) => {
            if (err) throw err;

            const setupCmd = `
                echo 'Arrd1227' | sudo -S mv /home/deploy/virtual.enaa.com.do.conf /etc/nginx/sites-available/virtual.enaa.com.do.conf &&
                echo 'Arrd1227' | sudo -S ln -sf /etc/nginx/sites-available/virtual.enaa.com.do.conf /etc/nginx/sites-enabled/ &&
                echo 'Arrd1227' | sudo -S nginx -t &&
                echo 'Arrd1227' | sudo -S systemctl reload nginx
            `;

            conn.exec(setupCmd.trim(), { pty: true }, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Nginx config restored and reloaded with code ' + code);
                    conn.end();
                }).on('data', (data) => {
                    console.log(data.toString());
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
