const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Iniciando migración de la tabla students...');

        // 1. Crear secuencia para matrícula si no existe
        await client.query(`
      CREATE SEQUENCE IF NOT EXISTS student_matricula_seq START WITH 1000;
    `);

        // 2. Agregar columnas si no existen
        const columns = [
            { name: 'document_type', type: 'VARCHAR(20) DEFAULT \'CEDULA\'' },
            { name: 'document_id', type: 'VARCHAR(50) UNIQUE' },
            { name: 'address', type: 'TEXT' },
            { name: 'matricula', type: 'VARCHAR(20) UNIQUE' },
            { name: 'sede_id', type: 'UUID REFERENCES sedes(id)' },
            { name: 'lead_id', type: 'UUID REFERENCES leads(id)' }
        ];

        for (const col of columns) {
            try {
                await client.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`Columna ${col.name} verificada/añadida.`);
            } catch (err) {
                console.log(`Nota: Columna ${col.name} ya podría existir o hubo un problema menor: ${err.message}`);
            }
        }

        console.log('Migración de students completada con éxito.');
    } catch (err) {
        console.error('Error durante la migración:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
