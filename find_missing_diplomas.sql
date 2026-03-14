SELECT i.invoice_number, s.first_name, s.last_name, id.description 
FROM invoice_details id 
JOIN invoices i ON id.invoice_id = i.id 
JOIN students s ON i.student_id = s.id 
WHERE (id.description ILIKE '%GRADU%') 
AND i.id NOT IN (SELECT invoice_id FROM diplomas WHERE invoice_id IS NOT NULL);
