const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let connectionString = "postgresql://postgres:postgres@localhost:5432/educrm";
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^DATABASE_URL=(.*)$/);
      if (match) {
        connectionString = match[1].trim().replace(/^["'](.*)["']$/, '$1');
        break;
      }
    }
  }
} catch (e) {
  console.log("Could not read .env");
}

console.log("Connecting to host...");
const pool = new Pool({ connectionString });

async function migrate() {
  try {
    console.log("Applying Individual Grades migration...");
    await pool.query(`
      ALTER TABLE grade_types ADD COLUMN IF NOT EXISTS is_individual BOOLEAN DEFAULT false;
      ALTER TABLE grade_types ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id);
    `);
    console.log("Migration applied successfully.");
  } catch (err) {
    console.error("Error applying migration:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
