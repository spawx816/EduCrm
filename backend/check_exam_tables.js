const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready - Checking exam tables and attendance error');

    // Test if exam tables exist on VPS, and also hit the attendance endpoint via curl
    const cmd = `
        PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('exam_assignments','exam_attempts','exams','attendance') ORDER BY table_name;" 2>&1 &&
        echo "---TESTING ATTENDANCE ENDPOINT---" &&
        curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/academic/attendance &&
        echo "" &&
        echo "---TESTING FULL HISTORY ENDPOINT ON FIRST STUDENT---" &&
        FIRST_STUDENT=$(PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -t -c "SELECT id FROM students LIMIT 1;" 2>&1 | tr -d ' ') &&
        echo "First student ID: $FIRST_STUDENT" &&
        curl -s "http://localhost:3000/api/students/$FIRST_STUDENT/history" | head -200 2>&1
    `;

    conn.exec(cmd, { pty: true }, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.on('stderr', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
