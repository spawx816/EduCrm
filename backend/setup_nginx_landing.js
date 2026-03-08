const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;
        sftp.fastPut('./enaa_landing.conf', '/home/deploy/enaa.com.do.landing.conf', (err) => {
            if (err) throw err;

            const setupCmd = `
                echo 'Arrd1227' | sudo -S mv /home/deploy/enaa.com.do.landing.conf /etc/nginx/sites-available/enaa.com.do.conf &&
                echo 'Arrd1227' | sudo -S ln -sf /etc/nginx/sites-available/enaa.com.do.conf /etc/nginx/sites-enabled/ &&
                echo 'Arrd1227' | sudo -S nginx -t &&
                echo 'Arrd1227' | sudo -S systemctl reload nginx
            `;

            conn.exec(setupCmd.trim(), { pty: true }, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Nginx config complete with code ' + code);
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
