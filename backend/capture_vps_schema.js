const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    // Check for the existence of ON CONFLICT in the compiled file.
    conn.exec("PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c \"\\d attendance\"", (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        let output = '';
        stream.on('data', (d) => output += d);
        stream.stderr.on('data', (d) => output += d);
        stream.on('close', () => {
            fs.writeFileSync('d:/EduC/apps/backend/vps_attendance_schema.txt', output);
            console.log('Schema saved');
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
