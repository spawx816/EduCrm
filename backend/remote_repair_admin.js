const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function repairAdmin() {
    const pool = new Pool({ connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm?schema=public' });
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'admin@educrm.com'", [hashedPassword]);
        console.log('REPAIRED_ADMIN_PASSWORD');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
repairAdmin();
