const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const query = "SELECT id, first_name, is_active FROM students LIMIT 5;";
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${query}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
