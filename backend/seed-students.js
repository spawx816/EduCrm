const { Pool } = require('pg');
require('dotenv').config();

async function seedStudents() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        try {
            console.log('Seeding students...');
            const students = [
                { first: 'Roberto', last: 'Gómez', email: 'roberto@example.com', phone: '555-0001' },
                { first: 'Elena', last: 'Rodríguez', email: 'elena@example.com', phone: '555-0002' },
                { first: 'Miguel', last: 'Ángel', email: 'miguel@example.com', phone: '555-0003' },
                { first: 'Lucía', last: 'Fernández', email: 'lucia@example.com', phone: '555-0004' },
                { first: 'Andrés', last: 'Castro', email: 'andres@example.com', phone: '555-0005' },
            ];

            for (const s of students) {
                await client.query(
                    'INSERT INTO students (first_name, last_name, email, phone) VALUES ($1, $2, $3, $4)',
                    [s.first, s.last, s.email, s.phone]
                );
            }

            console.log('Students seeded successfully!');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error seeding students:', err);
    } finally {
        await pool.end();
    }
}

seedStudents();
