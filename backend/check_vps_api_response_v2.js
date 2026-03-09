const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const cmd = "curl -s http://localhost:3001/exams/student/$(PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c \"SELECT id FROM students WHERE matricula = '001013'\" | xargs)/attempts";
    conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', (d) => out += d);
        stream.on('close', () => {
            console.log(out);
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
