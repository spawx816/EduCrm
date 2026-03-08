const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');

    // 1. Test POST to attendance with a bad payload to get the real error from NestJS
    // 2. Test the history endpoint which is more complex
    const cmd = `
        echo "=== Testing POST /api/academic/attendance ==="
        curl -s -X POST http://localhost:3000/api/academic/attendance \
          -H "Content-Type: application/json" \
          -d '{"cohort_id":"test","module_id":"test","date":"2026-03-08","records":[]}' 2>&1
        echo ""
        echo "=== PM2 Last Error ==="
        pm2 logs educrm-api --lines 30 --nostream 2>&1 | grep -i "error" | tail -20
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
