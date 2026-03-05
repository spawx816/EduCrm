-- Migration: Modular Exams System
-- Goal: Comprehensive exam management within the modular academic framework.

-- 1. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES academic_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER DEFAULT 60, -- Time to complete the exam
    passing_score NUMERIC(5,2) DEFAULT 60.00,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Questions Table
CREATE TYPE question_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'OPEN_TEXT');

CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type question_type NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    points NUMERIC(5,2) DEFAULT 1.00,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Options Table (for Multiple Choice / True/False)
CREATE TABLE IF NOT EXISTS exam_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0
);

-- 4. Exam Assignments (Link exam to cohort and specific module context)
CREATE TABLE IF NOT EXISTS exam_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    cohort_id UUID REFERENCES academic_cohorts(id) ON DELETE CASCADE,
    module_id UUID REFERENCES academic_modules(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE NULLS NOT DISTINCT (exam_id, cohort_id, module_id)
);

-- 5. Exam Attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES exam_assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score NUMERIC(5,2),
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, EXPIRED
    metadata JSONB, -- For storing browser info, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Exam Answers
CREATE TABLE IF NOT EXISTS exam_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES exam_options(id) ON DELETE CASCADE, -- Selected option
    text_answer TEXT, -- For open questions
    is_correct BOOLEAN,
    points_earned NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (attempt_id, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exams_module_id ON exams(module_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_cohort_id ON exam_assignments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_assignment_id ON exam_attempts(assignment_id);
