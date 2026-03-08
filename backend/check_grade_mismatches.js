const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    const query = "SELECT g.id, g.module_id, am.name as module_name, am.program_id as mod_prog_id, c.program_id as cohort_prog_id FROM grades g JOIN academic_modules am ON g.module_id = am.id JOIN academic_cohorts c ON g.cohort_id = c.id WHERE g.student_id = '4c1e59ec-f48c-4da7-a170-4357c91726a4' AND am.program_id != c.program_id;";
    conn.exec('echo "Arrd1227" | sudo -S -u postgres psql -d educrm -t -c "' + query + '"', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', (d) => output += d.toString());
        stream.on('close', () => {
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
