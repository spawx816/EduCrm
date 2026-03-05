const { Pool } = require('pg');
require('dotenv').config();

async function seedAcademic() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        try {
            console.log('Seeding academic programs...');

            const programs = [
                { name: 'Ingeniería de Software', code: 'ISW', description: 'Carrera de pregrado en desarrollo de software.' },
                { name: 'Administración de Empresas', code: 'ADM', description: 'Gestión y dirección empresarial.' },
                { name: 'Diseño Gráfico', code: 'DG', description: 'Comunicación visual y diseño creativo.' },
            ];

            for (const p of programs) {
                const res = await client.query(
                    'INSERT INTO academic_programs (name, code, description) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING RETURNING id',
                    [p.name, p.code, p.description]
                );
                const programId = res.rows[0]?.id;

                if (programId) {
                    console.log(`Seeding cohorts for ${p.name}...`);
                    const cohorts = [
                        { name: 'Semestre 2026-1', start_date: '2026-03-01', end_date: '2026-07-30' },
                        { name: 'Semestre 2026-2', start_date: '2026-08-15', end_date: '2026-12-20' },
                    ];

                    for (const c of cohorts) {
                        await client.query(
                            'INSERT INTO academic_cohorts (program_id, name, start_date, end_date) VALUES ($1, $2, $3, $4)',
                            [programId, c.name, c.start_date, c.end_date]
                        );
                    }
                }
            }

            console.log('Academic seeding completed successfully!');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error seeding academic data:', err);
    } finally {
        await pool.end();
    }
}

seedAcademic();
