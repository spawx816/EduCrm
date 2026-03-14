INSERT INTO diplomas (student_id, invoice_id, student_name, course_name)
SELECT s.id, i.id, UPPER(s.first_name || ' ' || s.last_name), p.name
FROM students s
JOIN invoices i ON s.id = i.student_id
JOIN enrollments e ON s.id = e.student_id
JOIN academic_cohorts c ON e.cohort_id = c.id
JOIN academic_programs p ON c.program_id = p.id
WHERE i.invoice_number IN ('INV-9052234', 'INV-80454129')
ON CONFLICT DO NOTHING;
