const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    // Just test for a random student or just the query syntax
    const query = "SELECT i.*, s.first_name, s.last_name, STRING_AGG(id.description, ', ') as concepts FROM invoices i JOIN students s ON i.student_id = s.id LEFT JOIN invoice_details id ON i.id = id.invoice_id WHERE 1=1 GROUP BY i.id, s.id ORDER BY i.created_at DESC LIMIT 5;";
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${query}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
