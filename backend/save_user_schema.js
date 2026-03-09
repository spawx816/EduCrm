const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "\\d users"`, (err, stream) => {
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            fs.writeFileSync('users_schema.txt', output);
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
