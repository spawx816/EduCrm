const { Client } = require('ssh2');
const conn = new Client();

const nginxConfig = `
server {
    server_name enaa.com.do www.enaa.com.do;

    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    location /assets/ {
        root /var/www/enaa.com.do/dist;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location /images/ {
        root /var/www/enaa.com.do/public;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location /media/ {
        root /var/www/enaa.com.do/public;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/enaa.com.do/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/enaa.com.do/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
server {
    if ($host = enaa.com.do) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name enaa.com.do www.enaa.com.do;
    return 404; # managed by Certbot
}
`;

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const fs = require('fs');
        fs.writeFileSync('enaa_caching.conf', nginxConfig.trim());

        sftp.fastPut('enaa_caching.conf', '/home/deploy/enaa.com.do.conf', (err) => {
            if (err) throw err;
            const setupCmd = `
                echo 'Arrd1227' | sudo -S mv /home/deploy/enaa.com.do.conf /etc/nginx/sites-available/enaa.com.do.conf &&
                echo 'Arrd1227' | sudo -S nginx -t &&
                echo 'Arrd1227' | sudo -S systemctl reload nginx
            `;
            conn.exec(setupCmd.trim(), { pty: true }, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code) => {
                    console.log('Nginx config updated code ' + code);
                    conn.end();
                }).on('data', (data) => console.log(data.toString()))
                    .stderr.on('data', (data) => console.log(data.toString()));
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
