const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });

    try {
        const data = {
            first_name: 'Debug',
            last_name: 'User',
            email: `debug.${Date.now()}@example.com`,
            document_type: 'CEDULA',
            document_id: `DEBUG-${Date.now()}`,
            phone: '809-000-0000',
            matricula: 'DB9999'
        };

        console.log('Attempting INSERT into students...');
        const res = await pool.query(
            `INSERT INTO students (first_name, last_name, email, document_type, document_id, phone, matricula)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [data.first_name, data.last_name, data.email, data.document_type, data.document_id, data.phone, data.matricula]
        );
        console.log('SUCCESS:', res.rows[0]);
    } catch (err) {
        console.error('DATABASE ERROR:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            table: err.table,
            constraint: err.constraint
        });
    } finally {
        await pool.end();
    }
}

main();
