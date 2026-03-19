const { Client } = require('ssh2');

const conn = new Client();
conn.on('error', (err) => {
    console.error('CONEXION ERROR:', err);
    process.exit(1);
});
conn.on('ready', () => {
    console.log('--- CONECTADO AL SERVIDOR ---');
    console.log('Iniciando script de despliegue desde GitHub...');
    conn.exec('cd /home/deploy/apps/EduCrm && git fetch --all && git reset --hard origin/main && bash ./deploy.sh', (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => process.stdout.write(d));
        stream.on('stderr', (d) => process.stderr.write(d));
        stream.on('close', (code) => {
            console.log('\nDeployment finished with code: ' + code);
            conn.end();
            process.exit(code);
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'root',
    password: 'mCiqhu2nqLDi'
});
