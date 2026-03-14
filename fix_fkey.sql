ALTER TABLE diplomas DROP CONSTRAINT diplomas_invoice_id_fkey;
ALTER TABLE diplomas ADD CONSTRAINT diplomas_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;
