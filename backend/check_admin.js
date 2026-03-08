const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function checkAdmin(connString, name) {
    const pool = new Pool({ connectionString: connString });
    try {
        const res = await pool.query("SELECT id, email, password_hash, is_active FROM users WHERE email = 'admin@educrm.com'");
        if (res.rows.length === 0) {
            console.log(`[${name}] Admin user 'admin@educrm.com' DOES NOT EXIST.`);
        } else {
            console.log(`[${name}] Admin user EXISTS.`);
            const user = res.rows[0];
            console.log(`[${name}] is_active: ${user.is_active}`);
            // Check password
            const isValid = await bcrypt.compare('password123', user.password_hash);
            console.log(`[${name}] password 'password123' is VALID: ${isValid}`);
        }
    } catch (e) {
        console.error(`[${name}] Error:`, e.message);
    } finally {
        await pool.end();
    }
}

async function run() {
    await checkAdmin('postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm?schema=public', 'LOCAL DATABASE');

    // Also check production DB via SSH by creating a string we can run over SSH
    console.log('\n--- Remote check will be done separately ---');
}
run();
