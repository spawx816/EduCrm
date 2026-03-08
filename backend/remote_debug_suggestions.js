const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');

    const studentQuery = "SELECT id FROM students WHERE first_name ILIKE '%Dionisio%' LIMIT 1";

    conn.exec(`echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "${studentQuery}"`, (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            const studentId = output.trim();
            if (!studentId) {
                console.log('Student not found');
                conn.end();
                return;
            }

            // Create a temporary node script on the server to run the logic
            const remoteScript = `
                const { Pool } = require('pg');
                const pool = new Pool({
                    user: 'postgres',
                    host: 'localhost',
                    database: 'educrm',
                    password: 'Arrd1227',
                    port: 5432,
                });

                async function debug() {
                    const studentId = '${studentId}';
                    const enrollmentRes = await pool.query(
                        "SELECT e.cohort_id, c.program_id FROM enrollments e JOIN academic_cohorts c ON e.cohort_id = c.id WHERE e.student_id = $1 AND e.status = 'ACTIVE' LIMIT 1",
                        [studentId]
                    );

                    if (enrollmentRes.rows.length === 0) {
                        console.log('No active enrollment found for ' + studentId);
                        return;
                    }

                    const program_id = enrollmentRes.rows[0].program_id;
                    const modulesRes = await pool.query(
                        "SELECT m.id, m.name FROM academic_modules m WHERE m.program_id = $1 AND m.deleted_at IS NULL ORDER BY m.order_index ASC",
                        [program_id]
                    );
                    const modules = modulesRes.rows;

                    const invoicedModulesRes = await pool.query(
                        "SELECT id.description FROM invoice_details id JOIN invoices i ON id.invoice_id = i.id WHERE i.student_id = $1 AND i.status != 'VOIDED' AND id.item_id IS NULL AND id.description NOT ILIKE '%Inscripción%'",
                        [studentId]
                    );
                    const invoicedNames = invoicedModulesRes.rows.map(r => r.description.toLowerCase());

                    console.log('MODULES:', JSON.stringify(modules));
                    console.log('INVOICED NAMES:', JSON.stringify(invoicedNames));

                    const suggestedModuleData = modules.find(m =>
                        !invoicedNames.some(name => name.includes(m.name.toLowerCase()))
                    );
                    console.log('SUGGESTED:', JSON.stringify(suggestedModuleData));
                    
                    await pool.end();
                }
                debug();
            `;

            conn.exec(`echo "${remoteScript.replace(/"/g, '\\"')}" > /tmp/debug_sugg.js && node /tmp/debug_sugg.js`, (err, stream) => {
                if (err) throw err;
                let output2 = '';
                stream.on('data', (d) => output2 += d.toString());
                stream.on('stderr', (d) => output2 += d.toString());
                stream.on('close', () => {
                    console.log(output2);
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
