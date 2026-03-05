const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedUsers() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        try {
            console.log('Seeding roles and users...');

            // Ensure roles exist
            await client.query(`
                INSERT INTO roles (name, display_name, is_system) VALUES 
                ('admin', 'Administrador', true),
                ('director', 'Director', true),
                ('docente', 'Docente', true),
                ('comercial', 'Asesor Comercial', true)
                ON CONFLICT (name) DO NOTHING
            `);

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            // Get role IDs
            const adminRole = await client.query("SELECT id FROM roles WHERE name = 'admin'");
            const docenteRole = await client.query("SELECT id FROM roles WHERE name = 'docente'");

            const adminId = adminRole.rows[0].id;
            const docenteId = docenteRole.rows[0].id;

            // Create Admin
            await client.query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role_id) 
                VALUES ($1, $2, $3, $4, $5) 
                ON CONFLICT (email) DO NOTHING
            `, ['admin@educrm.com', hashedPassword, 'Super', 'Admin', adminId]);

            // Create Teacher
            await client.query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role_id) 
                VALUES ($1, $2, $3, $4, $5) 
                ON CONFLICT (email) DO NOTHING
            `, ['maestro@educrm.com', hashedPassword, 'Juan', 'Docente', docenteId]);

            console.log('Users seeded successfully!');
            console.log('Admin: admin@educrm.com / password123');
            console.log('Maestro: maestro@educrm.com / password123');

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        await pool.end();
    }
}

seedUsers();
