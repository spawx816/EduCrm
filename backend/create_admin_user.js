const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Intentar cargar desde .env si existe
let connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/educrm";

try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=(.+)/);
    if (match && match[1]) {
      connectionString = match[1].trim();
    }
  }
} catch (e) {
  console.log("No se pudo leer el archivo .env, usando valores por defecto.");
}

const pool = new Pool({ connectionString });

async function createAdminUser() {
  const email = 'a@enaa.com.do';
  const password = '1227';
  const firstName = 'Admin';
  const lastName = 'User';

  try {
    // 1. Check if user exists
    const checkRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    // 2. Get Admin Role ID
    const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'admin' LIMIT 1");
    if (roleRes.rows.length === 0) {
      console.error("Role 'admin' not found. Please ensure roles table is populated.");
      return;
    }
    const roleId = roleRes.rows[0].id;

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (checkRes.rows.length > 0) {
      // Update existing user
      await pool.query(
        'UPDATE users SET password_hash = $1, role_id = $2, first_name = $3, last_name = $4 WHERE email = $5',
        [passwordHash, roleId, firstName, lastName, email]
      );
      console.log(`User ${email} updated successfully with new password.`);
    } else {
      // Insert new user
      await pool.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role_id) VALUES ($1, $2, $3, $4, $5)',
        [email, passwordHash, firstName, lastName, roleId]
      );
      console.log(`User ${email} created successfully.`);
    }

  } catch (err) {
    console.error("Error managing user:", err.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();
