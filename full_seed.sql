-- Seed Script for EduCRM
BEGIN;

-- 1. Sedes
INSERT INTO sedes (id, name, address, phone, email, is_active)
VALUES (gen_random_uuid(), 'Sede Central', 'Av. Principal #123, Santo Domingo', '809-555-0123', 'central@enaa.com.do', true);

-- 2. Lead Pipeline & Stages
WITH new_pipeline AS (
    INSERT INTO lead_pipelines (id, name, sede_id, is_default)
    VALUES (gen_random_uuid(), 'Pipeline General', (SELECT id FROM sedes LIMIT 1), true)
    RETURNING id
)
INSERT INTO pipeline_stages (pipeline_id, name, position, color, is_won, is_lost)
VALUES 
((SELECT id FROM new_pipeline), 'Nuevo Lead', 1, '#3b82f6', false, false),
((SELECT id FROM new_pipeline), 'Contactado', 2, '#8b5cf6', false, false),
((SELECT id FROM new_pipeline), 'Cita Agendada', 3, '#f59e0b', false, false),
((SELECT id FROM new_pipeline), 'Inscrito', 4, '#10b981', true, false),
((SELECT id FROM new_pipeline), 'Perdido', 5, '#ef4444', false, true);

-- 3. Academic Programs (Courses)
INSERT INTO academic_programs (id, name, code, description, is_active)
VALUES 
(gen_random_uuid(), 'Desarrollo Web Full Stack', 'WEB-001', 'Curso intensivo de frontend y backend', true),
(gen_random_uuid(), 'Marketing Digital', 'MKT-001', 'Estrategias digitales y redes sociales', true),
(gen_random_uuid(), 'Data Science', 'DATA-001', 'Análisis de datos y machine learning', true);

-- 4. Academic Cohorts
INSERT INTO academic_cohorts (id, program_id, name, start_date, is_active)
VALUES 
(gen_random_uuid(), (SELECT id FROM academic_programs WHERE code = 'WEB-001'), 'Enero 2024', '2024-01-15', true),
(gen_random_uuid(), (SELECT id FROM academic_programs WHERE code = 'MKT-001'), 'Febrero 2024', '2024-02-01', true),
(gen_random_uuid(), (SELECT id FROM academic_programs WHERE code = 'DATA-001'), 'Marzo 2024', '2024-03-01', true);

-- 5. Students
INSERT INTO students (id, first_name, last_name, email, phone, status, sede_id)
VALUES 
(gen_random_uuid(), 'Juan', 'Pérez', 'juan.perez@example.com', '809-111-2222', 'ACTIVE', (SELECT id FROM sedes LIMIT 1)),
(gen_random_uuid(), 'María', 'García', 'maria.garcia@example.com', '809-333-4444', 'ACTIVE', (SELECT id FROM sedes LIMIT 1)),
(gen_random_uuid(), 'Pedro', 'Rodríguez', 'pedro.rod@example.com', '809-555-6666', 'ACTIVE', (SELECT id FROM sedes LIMIT 1));

-- 6. Enrollments
INSERT INTO enrollments (student_id, cohort_id, enrollment_date, status)
VALUES 
((SELECT id FROM students WHERE email = 'juan.perez@example.com'), (SELECT id FROM academic_cohorts WHERE name = 'Enero 2024'), NOW(), 'ACTIVE'),
((SELECT id FROM students WHERE email = 'maria.garcia@example.com'), (SELECT id FROM academic_cohorts WHERE name = 'Febrero 2024'), NOW(), 'ACTIVE');

-- 7. Leads
INSERT INTO leads (first_name, last_name, email, phone, pipeline_id, stage_id, sede_id, source)
VALUES 
('Ana', 'Martínez', 'ana.mtz@example.com', '829-111-0000', 
 (SELECT id FROM lead_pipelines LIMIT 1), 
 (SELECT id FROM pipeline_stages WHERE name = 'Nuevo Lead' LIMIT 1), 
 (SELECT id FROM sedes LIMIT 1), 'Facebook'),
('Carlos', 'Sánchez', 'carlos.s@example.com', '829-222-9999', 
 (SELECT id FROM lead_pipelines LIMIT 1), 
 (SELECT id FROM pipeline_stages WHERE name = 'Contactado' LIMIT 1), 
 (SELECT id FROM sedes LIMIT 1), 'WhatsApp');

COMMIT;
