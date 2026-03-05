const { Pool } = require('pg');
require('dotenv').config();

async function seedPipelines() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        try {
            console.log('Seeding initial pipeline...');

            // Get a default sede
            const sedeRes = await client.query('INSERT INTO sedes (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id', ['Sede Principal']);
            let sedeId = sedeRes.rows[0]?.id;

            if (!sedeId) {
                const existingSede = await client.query('SELECT id FROM sedes LIMIT 1');
                sedeId = existingSede.rows[0]?.id;
            }

            const pipelineRes = await client.query(
                'INSERT INTO lead_pipelines (name, sede_id, is_default) VALUES ($1, $2, $3) RETURNING id',
                ['Pipeline de Ventas', sedeId, true]
            );
            const pipelineId = pipelineRes.rows[0].id;

            const stages = [
                { name: 'Prospecto Nuevo', position: 1, color: '#3b82f6' },
                { name: 'Contactado', position: 2, color: '#f59e0b' },
                { name: 'Cita Agendada', position: 3, color: '#8b5cf6' },
                { name: 'Evaluando', position: 4, color: '#10b981' },
                { name: 'Cerrado Ganado', position: 5, color: '#059669', is_won: true },
                { name: 'Cerrado Perdido', position: 6, color: '#dc2626', is_lost: true },
            ];

            for (const stage of stages) {
                await client.query(
                    'INSERT INTO pipeline_stages (pipeline_id, name, position, color, is_won, is_lost) VALUES ($1, $2, $3, $4, $5, $6)',
                    [pipelineId, stage.name, stage.position, stage.color, stage.is_won || false, stage.is_lost || false]
                );
            }

            console.log('Seeding completed successfully!');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error seeding pipelines:', err);
    } finally {
        await pool.end();
    }
}

seedPipelines();
