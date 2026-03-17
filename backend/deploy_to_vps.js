const { Client } = require('ssh2');
const fs = require('fs');

const filesToUpload = [
    { local: 'd:/EduC/apps/backend/src/exams/exams.service.ts', remote: '/home/deploy/apps/EduCrm/backend/src/exams/exams.service.ts' },
    { local: 'd:/EduC/apps/backend/src/academic/academic.service.ts', remote: '/home/deploy/apps/EduCrm/backend/src/academic/academic.service.ts' },
    { local: 'd:/EduC/apps/backend/src/students/students.service.ts', remote: '/home/deploy/apps/EduCrm/backend/src/students/students.service.ts' },
    { local: 'd:/EduC/apps/frontend/src/components/academic/GradesManager.tsx', remote: '/home/deploy/apps/EduCrm/frontend/src/components/academic/GradesManager.tsx' },
    { local: 'd:/EduC/apps/frontend/src/components/students/StudentAcademicHistory.tsx', remote: '/home/deploy/apps/EduCrm/frontend/src/components/students/StudentAcademicHistory.tsx' },
    { local: 'd:/EduC/apps/frontend/src/components/academic/StudentHistoryModal.tsx', remote: '/home/deploy/apps/EduCrm/frontend/src/components/academic/StudentHistoryModal.tsx' },
    { local: 'd:/EduC/apps/frontend/src/pages/PortalMain.tsx', remote: '/home/deploy/apps/EduCrm/frontend/src/pages/PortalMain.tsx' },
    { local: 'd:/EduC/apps/frontend/src/hooks/useAcademic.ts', remote: '/home/deploy/apps/EduCrm/frontend/src/hooks/useAcademic.ts' },
    { local: 'd:/EduC/apps/frontend/src/components/academic/CohortList.tsx', remote: '/home/deploy/apps/EduCrm/frontend/src/components/academic/CohortList.tsx' },
    { local: 'd:/EduC/apps/frontend/src/components/academic/CohortGradesReport.tsx', remote: '/home/deploy/apps/EduCrm/frontend/src/components/academic/CohortGradesReport.tsx' }
];

const conn = new Client();
conn.on('error', (err) => {
    console.error('CONEXION ERROR:', err);
    process.exit(1);
});
conn.on('ready', () => {
    console.log('--- CONECTADO AL SERVIDOR ---');
    conn.sftp((err, sftp) => {
        if (err) {
            console.error('SFTP ERROR:', err);
            process.exit(1);
        }
        
        let completed = 0;
        filesToUpload.forEach(file => {
            console.log(`Subiendo: ${file.local}...`);
            if (!fs.existsSync(file.local)) {
                console.error(`LOCAL FILE MISSING: ${file.local}`);
                return;
            }
            sftp.fastPut(file.local, file.remote, (err) => {
                if (err) {
                    console.error(`Error subiendo ${file.local}:`, err.message);
                } else {
                    console.log(`OK: ${file.local}`);
                }
                completed++;
                if (completed === filesToUpload.length) {
                    console.log('--- TODOS LOS ARCHIVOS SUBIDOS ---');
                    startUpdate();
                }
            });
        });
    });

    function startUpdate() {
        console.log('--- ACTUALIZANDO PESOS EN DB ---');
        const sql = `UPDATE grade_types SET weight = CASE WHEN name ILIKE '%Asistencia%' THEN 10 WHEN name ILIKE '%Careo%' THEN 25 WHEN name ILIKE '%Exposic%' THEN 25 WHEN name ILIKE '%Examen%' THEN 40 ELSE weight END WHERE program_id IN (SELECT id FROM academic_programs WHERE name ILIKE '%AGENTES%AEROL%AS%');`;
        
        const cmd = `PGPASSWORD="EducrmSecurePass2026!" psql -h localhost -U educrm_user -d educrm -c "${sql}"`;
        
        conn.exec(cmd, (err, stream) => {
            if (err) {
                console.error('EXEC ERROR (sql):', err);
                process.exit(1);
            }
            stream.on('data', d => console.log(d.toString()));
            stream.on('stderr', d => console.error(d.toString()));
            stream.on('close', () => {
                console.log('DB ACTUALIZADA.');
                buildBackend();
            });
        });
    }

    function buildBackend() {
        console.log('--- COMPILANDO BACKEND ---');
        conn.exec(`cd /home/deploy/apps/EduCrm/backend && npm run build`, (err, stream) => {
            if (err) {
                console.error('EXEC ERROR (backend build):', err);
                process.exit(1);
            }
            stream.on('data', (data) => process.stdout.write(data));
            stream.on('stderr', (data) => process.stderr.write(data));
            stream.on('close', (code) => {
                console.log(`\nBACKEND COMPILADO (Exit code: ${code})`);
                buildFrontend();
            });
        });
    }

    function buildFrontend() {
        console.log('--- COMPILANDO FRONTEND (Esto puede tardar...) ---');
        conn.exec(`cd /home/deploy/apps/EduCrm/frontend && npm run build`, (err, stream) => {
            if (err) {
                console.error('EXEC ERROR (frontend build):', err);
                process.exit(1);
            }
            stream.on('data', (data) => process.stdout.write(data));
            stream.on('stderr', (data) => process.stderr.write(data));
            stream.on('close', (code) => {
                console.log(`\nFRONTEND COMPILADO (Exit code: ${code})`);
                restartServices();
            });
        });
    }

    function restartServices() {
        console.log('--- REINICIANDO SERVICIOS ---');
        conn.exec(`pm2 restart all`, (err, stream) => {
            if (err) {
                console.error('EXEC ERROR (pm2):', err);
                process.exit(1);
            }
            stream.on('close', () => {
                console.log('--- DESPLIEGUE COMPLETADO EXITOSAMENTE ---');
                conn.end();
            });
        });
    }
}).connect({
    host: '74.208.192.253',
    port: 22,
    username: 'root',
    password: 'mCiqhu2nqLDi'
});
