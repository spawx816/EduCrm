
const { Pool } = require('pg');

const databaseUrl = "postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public";

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: false
});

async function migrate() {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS student_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES students(id),
        invoice_id UUID REFERENCES invoices(id),
        enrollment_id UUID REFERENCES enrollments(id),
        student_name TEXT NOT NULL,
        matricula TEXT NOT NULL,
        program_name TEXT NOT NULL,
        cohort_name TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`);
        console.log('Table student_cards created');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
