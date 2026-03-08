const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
    // 1. Check if constraint exists
    // 2. Trigger a real-looking attendance POST with valid-ish IDs
    // 3. Grab the raw PM2 log error lines
    const commands = [
        "PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c \"SELECT conname FROM pg_constraint WHERE conname LIKE '%attendance%';\" 2>&1",
        "echo '---FIRST STUDENT/COHORT IDS---'",
        "PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c \"SELECT e.id as enrollment_id, e.student_id, e.cohort_id, cm.module_id FROM enrollments e JOIN academic_cohort_modules cm ON e.cohort_id = cm.cohort_id LIMIT 1;\" 2>&1",
        "echo '---RAW PM2 LOG TAIL---'",
        "tail -n 60 /home/deploy/.pm2/logs/educrm-api-error.log 2>/dev/null | grep -v '^$' | tail -30"
    ].join(' && ');

    conn.exec(commands, { pty: true }, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.on('stderr', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
