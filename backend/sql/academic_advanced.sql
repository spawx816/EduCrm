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
