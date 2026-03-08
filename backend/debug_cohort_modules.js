const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // 1. Find the cohort IGA-MARZO
    // 2. See its program ID
    // 3. See all modules for THAT program ID
    const query = `
        WITH TARGET_COHORT AS (
            SELECT id, program_id, name FROM academic_cohorts WHERE name ILIKE '%IGA-MARZO%'
        )
        SELECT 
            tc.name as cohort_name,
            tc.program_id,
            p.name as program_name,
            am.id as module_id,
            am.name as module_name
        FROM TARGET_COHORT tc
        JOIN academic_programs p ON tc.program_id = p.id
        JOIN academic_modules am ON am.program_id = p.id
        ORDER BY am.order_index, am.name;
    `;
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
            console.log('Modules for IGA-MARZO cohort program:');
            console.log(output);
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
