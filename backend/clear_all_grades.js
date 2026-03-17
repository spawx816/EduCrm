const { Client } = require('ssh2');

const conn = new Client();
conn.on('error', (err) => {
    console.error('CONEXION ERROR:', err);
    process.exit(1);
});

conn.on('ready', () => {
    console.log('--- CONECTADO AL SERVIDOR ---');
    
    // Commands to clear all related grade data
    // TRUNCATE is faster and cleaner for "delete everything"
    const sql = `TRUNCATE TABLE grades, exam_attempts, exam_answers CASCADE;`;
    const cmd = `PGPASSWORD="EducrmSecurePass2026!" psql -h localhost -U educrm_user -d educrm -c "${sql}"`;
    
    console.log('Limpiando tablas: grades, exam_attempts, exam_answers...');
    
    conn.exec(cmd, (err, stream) => {
        if (err) {
            console.error('EXEC ERROR:', err);
            process.exit(1);
        }
        stream.on('data', d => console.log(d.toString()));
        stream.on('stderr', d => console.error(d.toString()));
        stream.on('close', () => {
            console.log('--- TODAS LAS CALIFICACIONES Y RESULTADOS HAN SIDO ELIMINADOS ---');
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'root',
    password: 'mCiqhu2nqLDi'
});
