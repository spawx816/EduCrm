const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');

    const cmd = `
        PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>&1
    `;

    conn.exec(cmd, { pty: true }, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.on('stderr', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
