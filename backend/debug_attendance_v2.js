const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');

    // Check the DB and PM2 error logs using the password via env var
    const cmd = `
        PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -d educrm -c "\\d attendance;" 2>&1 &&
        echo "---PM2 ERROR LOGS---" &&
        pm2 logs educrm-api --lines 200 --nostream 2>&1 | grep -E "Error|error|attendance|column|does not exist|violates|constraint|500" | head -40
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
