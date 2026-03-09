const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const tables = ['exams', 'exam_questions', 'exam_options', 'exam_assignments', 'exam_attempts'];
    let output = '';
    let completed = 0;

    tables.forEach(table => {
        conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "\\d ${table}"`, (err, stream) => {
            stream.on('data', (d) => output += `\n--- Table: ${table} ---\n${d.toString()}`);
            stream.on('close', () => {
                completed++;
                if (completed === tables.length) {
                    process.stdout.write(output);
                    conn.end();
                }
            });
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
