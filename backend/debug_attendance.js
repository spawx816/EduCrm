const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');

    // Check DB schema for attendance table
    const cmd = `
        psql -U educrm_user -d educrm -c "\\d attendance;" 2>&1 &&
        echo "---ERRORS---" &&
        pm2 logs educrm-api --lines 150 --nostream 2>&1 | grep -i "error\\|attendance\\|column\\|does not exist\\|500" -A2
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
