const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');

    conn.sftp((err, sftp) => {
        if (err) { console.error(err); conn.end(); return; }

        // First check if constraint exists and also get clean PM2 error
        const sql = `
SELECT conname FROM pg_constraint WHERE conname = 'attendance_student_cohort_date_module_key';
`;
        const localPath = 'd:/EduC/apps/check_constraint.sql';
        fs.writeFileSync(localPath.replace('d:/', 'D:/'), sql);

        sftp.fastPut(localPath.replace('d:/', 'D:/'), '/tmp/check_constraint.sql', {}, (uploadErr) => {
            if (uploadErr) { console.error(uploadErr); conn.end(); return; }

            const cmd = [
                "echo '=== Constraint Check ==='",
                "PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -f /tmp/check_constraint.sql 2>&1",
                "echo '=== Attendance Endpoint Test ==='",
                // POST that mimics what the frontend sends (empty records = no INSERT, just validates)
                "curl -s -X POST 'http://localhost:3000/api/academic/attendance' -H 'Content-Type: application/json' -d '{\"cohort_id\":\"fake-id\",\"module_id\":\"fake-module\",\"date\":\"2026-03-08\",\"records\":[]}' 2>&1",
                "echo ''",
                "echo '=== FRESH PM2 error lines ==='",
                "pm2 logs educrm-api --lines 5 --nostream 2>&1 | tail -10"
            ].join(' && ');

            conn.exec(cmd, { pty: true }, (execErr, stream) => {
                if (execErr) { console.error(execErr); conn.end(); return; }
                stream.on('data', (d) => process.stdout.write(d.toString()));
                stream.on('stderr', (d) => process.stderr.write(d.toString()));
                stream.on('close', () => conn.end());
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
