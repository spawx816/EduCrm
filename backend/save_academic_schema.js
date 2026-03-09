const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
    const tables = ['academic_modules', 'academic_cohort_modules'];
    let idx = 0;
    let fullOutput = '';

    const runNext = () => {
        if (idx >= tables.length) {
            fs.writeFileSync('academic_tables_schema.txt', fullOutput);
            conn.end();
            return;
        }
        const table = tables[idx++];
        fullOutput += `\n--- Table: ${table} ---\n`;
        conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "\\d ${table}"`, (err, stream) => {
            stream.on('data', (d) => fullOutput += d.toString());
            stream.on('close', runNext);
        });
    };
    runNext();
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
