const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    const studentQuery = "SELECT id, first_name, last_name FROM students WHERE first_name ILIKE '%Dionisio%' LIMIT 1";

    conn.exec(`echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "${studentQuery}"`, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            const parts = output.trim().split('|');
            if (parts.length < 1 || !parts[0].trim()) {
                console.log('Student not found');
                conn.end();
                return;
            }
            const studentId = parts[0].trim();
            console.log('Student ID:', studentId);

            const dataQuery = `
                SELECT 
                    e.id as enrollment_id,
                    e.status as enrollment_status,
                    c.name as cohort_name,
                    c.requires_enrollment,
                    p.name as program_name,
                    p.enrollment_price
                FROM enrollments e
                JOIN academic_cohorts c ON e.cohort_id = c.id
                JOIN academic_programs p ON c.program_id = p.id
                WHERE e.student_id = '${studentId}';

                SELECT id, total_amount, paid_amount, status, created_at
                FROM invoices 
                WHERE student_id = '${studentId}' AND status != 'VOIDED';

                SELECT id, invoice_id, description, amount
                FROM invoice_details
                WHERE invoice_id IN (SELECT id FROM invoices WHERE student_id = '${studentId}');
            `;

            conn.exec(`echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${dataQuery}"`, (err, stream) => {
                if (err) throw err;
                let output2 = '';
                stream.on('data', (d) => output2 += d.toString());
                stream.on('close', () => {
                    console.log('--- DB DATA ---');
                    console.log(output2);
                    console.log('----------------');
                    conn.end();
                });
            });
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
