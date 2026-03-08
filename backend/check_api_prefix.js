const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "=== PM2 STATUS ===" &&
        pm2 list &&
        echo "=== API PREFIX in main.js ===" &&
        grep -i "setGlobalPrefix\\|globalPrefix\\|api" /home/deploy/apps/EduCrm/backend/dist/main.js | head -5 &&
        echo "=== TEST WITHOUT /api PREFIX ===" &&
        curl -s -X POST http://localhost:3000/academic/attendance \
          -H "Content-Type: application/json" \
          -d '{"cohort_id":"test","module_id":"test","date":"2026-03-08","records":[]}' 2>&1 | head -3
    `;

    conn.exec(cmd, { pty: false }, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
