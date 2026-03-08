const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const sql = `
        ALTER TABLE exam_options ADD COLUMN IF NOT EXISTS match_text TEXT;
        
        -- Check columns for other tables used in ExamsService
        SELECT 'exam_questions' as tab, column_name FROM information_schema.columns WHERE table_name = 'exam_questions';
        SELECT 'exam_options' as tab, column_name FROM information_schema.columns WHERE table_name = 'exam_options';
        SELECT 'exams' as tab, column_name FROM information_schema.columns WHERE table_name = 'exams';
        SELECT 'exam_assignments' as tab, column_name FROM information_schema.columns WHERE table_name = 'exam_assignments';
        SELECT 'exam_attempts' as tab, column_name FROM information_schema.columns WHERE table_name = 'exam_attempts';
        SELECT 'exam_answers' as tab, column_name FROM information_schema.columns WHERE table_name = 'exam_answers';
    `;
    const cmd = `echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${sql.replace(/\n/g, ' ')}"`;
    conn.exec(cmd, { pty: true }, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
