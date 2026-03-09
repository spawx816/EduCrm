-- Final fix for grades unique constraint
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_student_id_cohort_id_module_id_grade_type_id_key;
ALTER TABLE public.grades ADD CONSTRAINT grades_student_id_cohort_id_module_id_grade_type_id_key UNIQUE (student_id, cohort_id, module_id, grade_type_id);
