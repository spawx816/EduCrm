const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    // Use fully qualified table name
    const sql = "ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();";
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${sql}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write("OUT: " + d));
        stream.stderr.on('data', (d) => process.stderr.write("ERR: " + d));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
