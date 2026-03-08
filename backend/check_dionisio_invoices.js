const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    const sql = `
        SELECT id.description, i.status, i.created_at
        FROM invoice_details id
        JOIN invoices i ON id.invoice_id = i.id
        WHERE i.student_id = (SELECT id FROM students WHERE first_name ILIKE '%Dionisio%' AND last_name ILIKE '%Ramirez%' LIMIT 1)
        AND i.status != 'VOIDED';
    `;
    const cmd = `echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${sql}"`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log(output);
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
