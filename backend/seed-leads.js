const { Pool } = require('pg');
require('dotenv').config();

async function seedLeads() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        try {
            console.log('Fetching pipeline and stages...');
            const pipelineRes = await client.query("SELECT id FROM lead_pipelines WHERE name = 'Pipeline de Ventas' LIMIT 1");
            const pipelineId = pipelineRes.rows[0].id;

            const stagesRes = await client.query("SELECT id, name FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY position", [pipelineId]);
            const stages = stagesRes.rows;

            console.log('Seeding leads...');
            const leads = [
                { first: 'Juan', last: 'Pérez', email: 'juan@example.com', phone: '555-1234', stageIdx: 0, source: 'Facebook' },
                { first: 'María', last: 'García', email: 'maria@example.com', phone: '555-5678', stageIdx: 0, source: 'LinkedIn' },
                { first: 'Carlos', last: 'López', email: 'carlos@example.com', phone: '555-9012', stageIdx: 1, source: 'Referido' },
                { first: 'Ana', last: 'Martínez', email: 'ana@example.com', phone: '555-3456', stageIdx: 2, source: 'Web' },
                { first: 'Pedro', last: 'Sánchez', email: 'pedro@example.com', phone: '555-7890', stageIdx: 3, source: 'Directo' },
            ];

            for (const lead of leads) {
                const stageId = stages[lead.stageIdx].id;
                await client.query(
                    'INSERT INTO leads (first_name, last_name, email, phone, pipeline_id, stage_id, source) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [lead.first, lead.last, lead.email, lead.phone, pipelineId, stageId, lead.source]
                );
            }

            console.log('Leads seeded successfully!');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error seeding leads:', err);
    } finally {
        await pool.end();
    }
}

seedLeads();
