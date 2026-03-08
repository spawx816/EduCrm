const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    // Get columns with their schemas
    const sql = "SELECT table_schema, column_name FROM information_schema.columns WHERE table_name = 'attendance' ORDER BY table_schema;";
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${sql}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d));
        stream.stderr.on('data', (d) => process.stderr.write(d));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
