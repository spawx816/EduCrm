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
