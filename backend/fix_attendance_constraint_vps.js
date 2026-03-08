const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    // Use sudo to run psql as postgres for absolute permissions.
    const sql = `
        -- Step 1: Drop the old constraint if it exists
        ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS "attendance_student_id_cohort_id_date_key";
        
        -- Step 2: Clean any duplicates for the NEW constraint (4 columns)
        DELETE FROM public.attendance
        WHERE ctid NOT IN (
            SELECT MAX(ctid)
            FROM public.attendance
            GROUP BY student_id, cohort_id, date, module_id
        );
        
        -- Step 3: Add the correct unique constraint
        ALTER TABLE public.attendance 
        ADD CONSTRAINT attendance_student_cohort_date_module_key 
        UNIQUE (student_id, cohort_id, date, module_id);
        
        -- Step 4: Verify the new constraint
        SELECT conname, pg_get_constraintdef(oid) 
        FROM pg_constraint 
        WHERE conname = 'attendance_student_cohort_date_module_key';
    `;
    const cmd = `echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${sql.replace(/\n/g, ' ')}"`;
    conn.exec(cmd, { pty: true }, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
