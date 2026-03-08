-- Use exactly the names found in \d
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS "attendance_student_id_cohort_id_date_key";

-- Double check if the other name was also used
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS "attendance_student_cohort_date_module_key";

-- Clean any duplicates for the NEW constraint (4 columns)
DELETE FROM public.attendance
WHERE ctid NOT IN (
    SELECT MAX(ctid)
    FROM public.attendance
    GROUP BY student_id, cohort_id, date, module_id
);

-- Add the correct unique constraint
ALTER TABLE public.attendance 
ADD CONSTRAINT attendance_student_cohort_date_module_key 
UNIQUE (student_id, cohort_id, date, module_id);
