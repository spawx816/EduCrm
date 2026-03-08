const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    // Find student ID for 'Dionisio Ramirez'
    const findStudentSql = "SELECT id, first_name, last_name FROM students WHERE first_name ILIKE '%Dionisio%' AND last_name ILIKE '%Ramirez%' LIMIT 1";

    conn.exec(`echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "${findStudentSql}"`, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            const studentId = output.trim().split('|')[0].trim();
            console.log('Found Student ID:', studentId);

            if (!studentId) {
                console.log('Student not found');
                conn.end();
                return;
            }

            // Now run a script on the server that imports the Service and calls the method? 
            // Or just run the SQL logic manually.

            const debugSql = `
                WITH enrollment_data AS (
                    SELECT e.cohort_id, c.program_id, c.requires_enrollment, p.enrollment_price, p.name as program_name, p.billing_day
                    FROM enrollments e 
                    JOIN academic_cohorts c ON e.cohort_id = c.id 
                    JOIN academic_programs p ON c.program_id = p.id
                    WHERE e.student_id = '${studentId}' AND e.status = 'ACTIVE' 
                    LIMIT 1
                ),
                invoiced_enrollment AS (
                    SELECT i.status, i.paid_amount, i.total_amount 
                    FROM invoice_details id
                    JOIN invoices i ON id.invoice_id = i.id
                    CROSS JOIN enrollment_data ed
                    WHERE i.student_id = '${studentId}' AND id.description ILIKE '%Inscripción%' || ed.program_name || '%' AND i.status != 'VOIDED'
                )
                SELECT 
                    (SELECT COUNT(*) FROM academic_modules WHERE program_id = (SELECT program_id FROM enrollment_data)) as module_count,
                    (SELECT array_agg(name) FROM academic_modules WHERE program_id = (SELECT program_id FROM enrollment_data) ORDER BY order_index) as module_names,
                    (SELECT array_agg(description) FROM invoice_details id JOIN invoices i ON id.invoice_id = i.id WHERE i.student_id = '${studentId}' AND i.status != 'VOIDED' AND id.item_id IS NULL AND id.description NOT ILIKE '%Inscripción%') as invoiced_modules,
                    (SELECT requires_enrollment FROM enrollment_data) as requires_enrollment
            `;

            conn.exec(`echo "Arrd1227" | sudo -S -u postgres psql -d educrm -c "${debugSql}"`, (err, stream) => {
                if (err) throw err;
                let output2 = '';
                stream.on('data', (d) => output2 += d.toString());
                stream.on('close', () => {
                    console.log('--- DEBUG INFO ---');
                    console.log(output2);
                    console.log('-------------------');
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
