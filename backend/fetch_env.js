const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;
        sftp.fastGet('/home/deploy/apps/EduCrm/backend/.env', './remote.env', (err) => {
            if (err) console.log(err); else console.log('Downloaded remote .env');

            conn.exec('pm2 jlist', (err, stream) => {
                let dataOut = '';
                stream.on('data', d => dataOut += d.toString());
                stream.on('close', () => {
                    // Extract just the JSON part in case there's an [PM2] prefix
                    const match = dataOut.match(/\[.*\]/s);
                    if (match) {
                        require('fs').writeFileSync('./pm2_jlist.json', match[0]);
                    } else {
                        require('fs').writeFileSync('./pm2_jlist.json', dataOut);
                    }
                    console.log('Downloaded pm2 jlist');
                    conn.end();
                });
            });
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
