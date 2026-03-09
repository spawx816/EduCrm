const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const sql = "SELECT id, name FROM academic_modules;";
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "${sql}"`, (err, stream) => {
        let out = '';
        stream.on('data', (d) => out += d);
        stream.on('close', () => {
            console.log(out);
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
