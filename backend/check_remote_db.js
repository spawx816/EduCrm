const { Client } = require('ssh2');
const conn = new Client();

const query = `
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
});
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
  .then(res => { console.log(res.rows.map(r => r.table_name).join(', ')); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
`;

conn.on('ready', () => {
    conn.exec(`cd /home/deploy/apps/EduCrm/backend && node -e "${query.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log('TABLES: ' + data);
        }).stderr.on('data', (data) => {
            console.log('ERR: ' + data);
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
