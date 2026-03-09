const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const query = `
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES users(id);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `;
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${query}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
