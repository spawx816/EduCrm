const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready - Applying attendance constraint migration');

    const migrationSQL = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'attendance_student_cohort_date_module_key'
          ) THEN
            ALTER TABLE attendance
            ADD CONSTRAINT attendance_student_cohort_date_module_key
            UNIQUE (student_id, cohort_id, date, module_id);
            RAISE NOTICE 'Constraint added successfully.';
          ELSE
            RAISE NOTICE 'Constraint already exists, skipping.';
          END IF;
        END $$;
    `;

    const cmd = `PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${migrationSQL.replace(/\n/g, ' ').replace(/"/g, '\\"')}" 2>&1`;

    conn.exec(cmd, { pty: true }, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.on('stderr', (d) => process.stderr.write(d.toString()));
        stream.on('close', (code) => {
            console.log('\nMigration finished with code:', code);
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
