const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const cmd = "pm2 jlist";
    conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', (d) => out += d);
        stream.on('close', () => {
            const data = JSON.parse(out);
            const api = data.find(p => p.name === 'educrm-api');
            console.log(JSON.stringify({
                name: api.name,
                pm_exec_path: api.pm2_env.pm_exec_path,
                pm_cwd: api.pm2_env.pm_cwd,
                status: api.pm2_env.status
            }, null, 2));
            conn.end();
        });
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
