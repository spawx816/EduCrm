const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready - Force Deployment');

    const cmd = `
        cd /home/deploy/apps/EduCrm &&
        echo "Resetting root..." &&
        git reset --hard origin/main &&
        git clean -fd &&
        
        echo "Resetting backend..." &&
        cd backend && git reset --hard origin/main && git clean -fd &&
        
        echo "Resetting frontend..." &&
        cd ../frontend && git reset --hard origin/main && git clean -fd &&
        
        echo "Running deploy.sh..." &&
        cd /home/deploy/apps/EduCrm && bash deploy.sh
    `;

    conn.exec(cmd, { pty: true }, (err, stream) => {
        if (err) {
            console.error('Error executing command:', err);
            conn.end();
            return;
        }

        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.on('stderr', (d) => process.stderr.write(d.toString()));
        stream.on('close', (code) => {
            console.log('\nForce deployment finished with code:', code);
            conn.end();
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
