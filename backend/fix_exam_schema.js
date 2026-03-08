const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const sql = `
        ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS image_url TEXT;
        SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exam_options';
    `;
    const cmd = `echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${sql.replace(/\n/g, ' ')}"`;
    conn.exec(cmd, { pty: true }, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
