const { Pool } = require('pg');
require('dotenv').config();

async function seedBilling() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        try {
            console.log('Seeding billing items...');

            const items = [
                { name: 'Matrícula Semestral', description: 'Costo de inscripción por semestre.', price: 250.00 },
                { name: 'Mensualidad Académica', description: 'Cuota mensual de estudios.', price: 150.00 },
                { name: 'Derecho de Certificación', description: 'Costo por emisión de certificados.', price: 50.00 },
                { name: 'Material Bibliográfico', description: 'Libros y guías de estudio.', price: 80.00 },
            ];

            for (const item of items) {
                await client.query(
                    'INSERT INTO billing_items (name, description, price) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [item.name, item.description, item.price]
                );
            }

            console.log('Billing items seeded successfully!');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error seeding billing data:', err);
    } finally {
        await pool.end();
    }
}

seedBilling();
