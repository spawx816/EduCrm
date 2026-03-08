const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    // Check constraints and indexes for the attendance table.
    const sql = `
SELECT 
    conname AS constraint_name, 
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'attendance';

SELECT 
    indexname AS index_name, 
    indexdef AS index_definition
FROM pg_indexes 
WHERE tablename = 'attendance';
`;
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${sql}"`, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
