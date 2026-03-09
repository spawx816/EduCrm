const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const studentId = '4fe6b0fd-3844-4ee5-9d38-06d4ca1341dc';
    const query = `SELECT i.*, i.created_at as issue_date, s.first_name, s.last_name, STRING_AGG(id.description, ', ') as concepts FROM invoices i JOIN students s ON i.student_id = s.id LEFT JOIN invoice_details id ON i.id = id.invoice_id WHERE i.student_id = '${studentId}' GROUP BY i.id, s.id, s.first_name, s.last_name ORDER BY i.created_at DESC;`;
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "${query}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
