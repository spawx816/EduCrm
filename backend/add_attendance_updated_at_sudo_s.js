const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    // Pass password to sudo -S
    const sql = "ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();";
    const cmd = `echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${sql}"`;
    conn.exec(cmd, { pty: true }, (err, stream) => {
        stream.on('data', (d) => process.stdout.write("OUT: " + d));
        stream.stderr.on('data', (d) => process.stderr.write("ERR: " + d));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
