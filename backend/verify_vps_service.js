const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // Check for the existence of ON CONFLICT in the compiled file.
    conn.exec('grep -C 5 "ON CONFLICT" /home/deploy/apps/EduCrm/backend/dist/academic/academic.service.js', (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
