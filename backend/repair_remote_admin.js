const { Client } = require('ssh2');
const conn = new Client();

const innerScript = `
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function repairAdmin() {
    const pool = new Pool({ connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm?schema=public' });
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'admin@educrm.com'", [hashedPassword]);
        console.log('REPAIRED_ADMIN_PASSWORD');
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
repairAdmin();
`;

conn.on('ready', () => {
    conn.exec(`cd /home/deploy/apps/EduCrm/backend && node -e "${innerScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.log('ERR: ' + data.toString());
        });
    });
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'deploy',
    password: 'Arrd1227'
});
