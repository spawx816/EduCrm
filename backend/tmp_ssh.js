const { Client } = require('ssh2');

const conn = new Client();
const command = process.argv[2] || 'pm2 list';
const password = 'Arrd1227';

conn.on('ready', () => {
    console.log('Client :: ready');
    // Using { pty: true } to better handle sudo prompts if they appear
    conn.exec(command, { pty: true }, (err, stream) => {
        if (err) throw err;

        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', (data) => {
            const output = data.toString();
            process.stdout.write(output);

            // Handle sudo password prompt if it appears
            if (output.includes('[sudo] password for deploy:')) {
                stream.write(password + '\n');
            }
        }).stderr.on('data', (data) => {
            process.stderr.write(data.toString());
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
