const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    conn.exec("PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c \"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'attendance';\"", (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d));
        stream.stderr.on('data', (d) => process.stderr.write(d));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
