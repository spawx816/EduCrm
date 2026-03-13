const { Pool } = require('pg');
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

async function checkTable() {
  try {
    const res = await pool.query(`
      CREATE TABLE IF NOT EXISTS diplomas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES students(id),
        invoice_id UUID REFERENCES invoice_payments(id),
        student_name VARCHAR(255) NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'diplomas' checked/created successfully.");
    
    const count = await pool.query("SELECT COUNT(*) FROM diplomas");
    console.log("Current diplomas count:", count.rows[0].count);
    
  } catch (err) {
    console.error("Error checking table:", err.message);
  } finally {
    await pool.end();
  }
}

checkTable();
