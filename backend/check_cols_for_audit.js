const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const query = `
        SELECT count(*) FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name IN ('voided_at', 'voided_by');
        SELECT count(*) FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'is_active';
        SELECT count(*) FROM information_schema.columns 
        WHERE table_name = 'enrollments' AND column_name = 'status';
    `;
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${query}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
