const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const studentIdSql = "SELECT id FROM students WHERE matricula = '001013'";
    const cmd = `
        STUDENT_ID=$(PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "${studentIdSql}" | xargs);
        echo "--- ATTENDANCE ---";
        curl -s http://localhost:3000/students/portal/attendance/$STUDENT_ID | jq -r '.[0].cohort_id';
        echo "--- EXAMS ---";
        curl -s http://localhost:3000/exams/student/$STUDENT_ID/attempts | jq -r '.[0].cohort_id';
        echo "--- ACADEMIC ---";
        curl -s http://localhost:3000/students/portal/academic/$STUDENT_ID | jq -r '.[0].cohort_id';
    `;
    conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', (d) => out += d);
        stream.on('close', () => {
            console.log(out);
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
