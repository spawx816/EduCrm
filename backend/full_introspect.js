const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const query = "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('invoices', 'students', 'enrollments') ORDER BY table_name, ordinal_position;";
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "${query}"`, (err, stream) => {
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log(output);
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
