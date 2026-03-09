const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const tables = ['exams', 'exam_questions', 'exam_options', 'exam_assignments', 'exam_attempts'];
    let idx = 0;

    const runNext = () => {
        if (idx >= tables.length) {
            conn.end();
            return;
        }
        const table = tables[idx++];
        process.stdout.write(`\n--- Table: ${table} ---\n`);
        conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "\\d ${table}"`, (err, stream) => {
            stream.on('data', (d) => process.stdout.write(d.toString()));
            stream.on('close', runNext);
        });
    };
    runNext();
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
