-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    cohort_id UUID REFERENCES academic_cohorts(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LATE
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, cohort_id, date)
);

-- Grade Types (Configurables por Programa)
CREATE TABLE IF NOT EXISTS grade_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES academic_programs(id),
    name VARCHAR(100) NOT NULL,
    weight DECIMAL(5,2) DEFAULT 1.00, -- Peso de la nota en el promedio final
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grades
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    cohort_id UUID REFERENCES academic_cohorts(id),
    grade_type_id UUID REFERENCES grade_types(id),
    value DECIMAL(5,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_cohort_id ON attendance(cohort_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_cohort_id ON grades(cohort_id);
-- Modular Expansion
-- 1. Table for Modules within a Program
CREATE TABLE IF NOT EXISTS academic_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES academic_programs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. Link Cohort + Module + Instructor
CREATE TABLE IF NOT EXISTS academic_cohort_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES academic_cohorts(id) ON DELETE CASCADE,
    module_id UUID REFERENCES academic_modules(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id), -- User with role 'docente'
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cohort_id, module_id)
);

-- 3. Update Grade Types to belong to a Module
ALTER TABLE grade_types ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES academic_modules(id) ON DELETE CASCADE;

-- 4. Update Attendance to support Module-level tracking
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES academic_modules(id) ON DELETE CASCADE;

-- 5. Update Grades to support Module-level tracking
ALTER TABLE grades ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES academic_modules(id) ON DELETE CASCADE;

-- Adjust UNIQUE constraints if necessary (depending on existing data)
-- For a fresh system, we would want UNIQUE(student_id, cohort_id, module_id, date) in attendance.
-- And UNIQUE(student_id, cohort_id, module_id, grade_type_id) in grades.

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_modules_program_id ON academic_modules(program_id);
CREATE INDEX IF NOT EXISTS idx_cohort_modules_cohort_id ON academic_cohort_modules(cohort_id);
CREATE INDEX IF NOT EXISTS idx_attendance_module_id ON attendance(module_id);
CREATE INDEX IF NOT EXISTS idx_grades_module_id ON grades(module_id);
-- Add billing_day to academic_programs
-- Defaults to 5 (5th of each month) as a common billing day
ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS billing_day INTEGER DEFAULT 5;
ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS enrollment_price DECIMAL(12,2) DEFAULT 0;
-- Categorías de Gastos
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Gastos
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES expense_categories(id),
    amount DECIMAL(15, 2) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    payment_method VARCHAR(50), -- Efectivo, Transferencia, Tarjeta, etc.
    reference_number VARCHAR(100), -- Número de recibo o factura del proveedor
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías por defecto
INSERT INTO expense_categories (name, description, is_system) VALUES 
('Renta y Local', 'Gastos de alquiler de instalaciones', true),
('Servicios Públicos', 'Luz, agua, internet, telefonía', true),
('Suministros y Papelería', 'Material de oficina y limpieza', true),
('Marketing y Publicidad', 'Facebook Ads, Google Ads, volantes', true),
('Mantenimiento', 'Reparaciones y mejoras del local', true),
('Impuestos y Licencias', 'Pagos al gobierno y permisos', true),
('Otros', 'Gastos generales no categorizados', true)
ON CONFLICT (name) DO NOTHING;

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
-- Instructor Payroll Schema

CREATE TABLE IF NOT EXISTS instructor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instructor_payments_teacher_id ON instructor_payments(teacher_id);
-- Modular Pricing & Addons Schema
-- 1. Add price to academic_modules
ALTER TABLE academic_modules ADD COLUMN IF NOT EXISTS price DECIMAL(12,2) DEFAULT 0;

-- 2. Table for Module Addons (Optional Items)
CREATE TABLE IF NOT EXISTS academic_module_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES academic_modules(id) ON DELETE CASCADE,
    item_id UUID REFERENCES billing_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, item_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_module_addons_module_id ON academic_module_addons(module_id);
-- Scholarship Management Module

-- 1. Table for Scholarships
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED
    value DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Link Scholarships to Enrollments
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS scholarship_id UUID REFERENCES scholarships(id);

-- 3. Track Scholarship impact on Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS scholarship_id UUID REFERENCES scholarships(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;

-- 4. Initial Generic Scholarships
INSERT INTO scholarships (name, description, type, value) VALUES
('Beca Familiar', 'Descuento para hermanos o familiares directos', 'PERCENTAGE', 10.00),
('Beca Mérito Académico', 'Otorgada por excelencia en notas previas', 'PERCENTAGE', 25.00),
('Beca Completa', 'Cobertura total por convenio institucional', 'PERCENTAGE', 100.00),
('Descuento Pago Contado', 'Reducción fija por liquidación anticipada', 'FIXED', 50.00)
ON CONFLICT DO NOTHING;
-- Fix missing columns in students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS matricula VARCHAR(20) UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS document_type VARCHAR(20) DEFAULT 'CEDULA';
ALTER TABLE students ADD COLUMN IF NOT EXISTS document_id VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;

-- Add unique constraint for document_id (expected by StudentsService)
ALTER TABLE students ADD CONSTRAINT students_document_id_key UNIQUE (document_id);

-- Ensure correct permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO educrm_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO educrm_user;
-- Fix missing columns in billing tables
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS scholarship_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

ALTER TABLE invoice_details ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0;

-- Ensure permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO educrm_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO educrm_user;
