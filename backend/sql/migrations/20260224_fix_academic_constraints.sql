-- Migration: Fix Academic Constraints for Modularity
-- Goal: Allow multiple attendance/grade records for the same student/cohort on the same day if the module is different.

-- 1. Fix Attendance Constraints using PG 15+ NULLS NOT DISTINCT
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_id_cohort_id_date_key;
DROP INDEX IF EXISTS idx_attendance_modular_unique;

ALTER TABLE attendance ADD CONSTRAINT attendance_modular_unique 
UNIQUE NULLS NOT DISTINCT (student_id, cohort_id, date, module_id);

-- 2. Fix Grades Constraints using PG 15+ NULLS NOT DISTINCT
ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_student_id_cohort_id_grade_type_id_key;
DROP INDEX IF EXISTS idx_grades_modular_unique;

ALTER TABLE grades ADD CONSTRAINT grades_modular_unique 
UNIQUE NULLS NOT DISTINCT (student_id, cohort_id, module_id, grade_type_id);

-- 3. Fix Enrollments Duplicates
-- If there are duplicates, we need to keep only one.
DELETE FROM enrollments
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (PARTITION BY student_id, cohort_id ORDER BY created_at DESC) as row_num
        FROM enrollments
    ) t
    WHERE t.row_num > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_student_cohort_unique;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_student_cohort_unique UNIQUE (student_id, cohort_id);
