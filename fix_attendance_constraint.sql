-- Show duplicates count
SELECT COUNT(*) as duplicate_groups FROM (
    SELECT student_id, cohort_id, date, module_id
    FROM attendance
    GROUP BY student_id, cohort_id, date, module_id
    HAVING COUNT(*) > 1
) dups;

-- Delete duplicates, keep the row with highest ctid (most recently inserted)
DELETE FROM attendance
WHERE ctid NOT IN (
    SELECT MAX(ctid)
    FROM attendance
    GROUP BY student_id, cohort_id, date, module_id
);

-- Now add the unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'attendance_student_cohort_date_module_key'
  ) THEN
    ALTER TABLE attendance
    ADD CONSTRAINT attendance_student_cohort_date_module_key
    UNIQUE (student_id, cohort_id, date, module_id);
    RAISE NOTICE 'Constraint attendance_student_cohort_date_module_key added.';
  ELSE
    RAISE NOTICE 'Constraint attendance_student_cohort_date_module_key already exists.';
  END IF;
END $$;

-- Verify
SELECT conname FROM pg_constraint WHERE conname = 'attendance_student_cohort_date_module_key';
