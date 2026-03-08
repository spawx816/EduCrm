const { Client } = require('ssh2');
const conn = new Client();

const innerScript = `
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function testAdmin() {
    const pool = new Pool({ connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm?schema=public' });
    try {
        const res = await pool.query("SELECT id, email, password_hash, is_active FROM users WHERE email = 'admin@educrm.com'");
        if (res.rows.length === 0) {
            console.log('ADMIN_MISSING');
        } else {
            console.log('ADMIN_EXISTS');
            const isValid = await bcrypt.compare('password123', res.rows[0].password_hash);
            console.log('PASSWORD_VALID: ' + isValid);
        }
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
testAdmin();
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
