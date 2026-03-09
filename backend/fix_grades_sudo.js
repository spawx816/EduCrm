const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const sql = "ALTER TABLE grades ADD CONSTRAINT grades_student_id_cohort_id_module_id_grade_type_id_key UNIQUE (student_id, cohort_id, module_id, grade_type_id);";
    const cmd = `echo 'Arrd1227' | sudo -S -u postgres psql -d educrm -c "${sql}"`;
    conn.exec(cmd, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
