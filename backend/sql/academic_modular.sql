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
