const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const tables = ['exam_questions', 'exam_options', 'exams', 'exam_assignments', 'exam_attempts', 'exam_answers'];
    let results = {};
    let completed = 0;

    tables.forEach(table => {
        const sql = `SELECT json_agg(column_name) FROM information_schema.columns WHERE table_name = '${table}';`;
        conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "${sql}"`, (err, stream) => {
            let out = '';
            stream.on('data', (d) => out += d);
            stream.on('close', () => {
                results[table] = JSON.parse(out.trim() || '[]');
                completed++;
                if (completed === tables.length) {
                    console.log(JSON.stringify(results, null, 2));
                    conn.end();
                }
            });
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
