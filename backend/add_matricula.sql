-- 1. Create a sequence for the matricula starting at 1
CREATE SEQUENCE IF NOT EXISTS student_matricula_seq START 1;

-- 2. Add the matricula column if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS matricula VARCHAR(20) UNIQUE;

-- 5. Backfill existing students that don't have a matricula 
UPDATE students 
SET matricula = LPAD(nextval('student_matricula_seq')::text, 5, '0') 
WHERE matricula IS NULL OR matricula = '';
