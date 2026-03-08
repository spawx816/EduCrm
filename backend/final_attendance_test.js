const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        COHORT=$(PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "SELECT cohort_id FROM enrollments LIMIT 1;" 2>&1 | tr -d ' \\r\\n') &&
        MODULE=$(PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "SELECT module_id FROM academic_cohort_modules LIMIT 1;" 2>&1 | tr -d ' \\r\\n') &&
        STUDENT=$(PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "SELECT student_id FROM enrollments LIMIT 1;" 2>&1 | tr -d ' \\r\\n') &&
        
        echo "Testing internal port 3001 without /api prefix..." &&
        curl -s -X POST http://localhost:3001/academic/attendance \
          -H "Content-Type: application/json" \
          -d "{\\"cohort_id\\":\\"$COHORT\\",\\"module_id\\":\\"$MODULE\\",\\"date\\":\\"2026-03-08\\",\\"records\\":[{\\"student_id\\":\\"$STUDENT\\",\\"status\\":\\"PRESENT\\",\\"remarks\\":\\"internal test\\"}]}" 2>&1
    `;

    conn.exec(cmd, { pty: false }, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
