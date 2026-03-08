const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://educrm_user:EducrmSecurePass2026!@localhost:5432/educrm'
    });

    try {
        const studentRes = await pool.query('SELECT id FROM students LIMIT 1');
        const itemRes = await pool.query('SELECT id FROM billing_items LIMIT 1');

        if (studentRes.rows.length === 0 || itemRes.rows.length === 0) {
            console.log('No students or items found to test.');
            return;
        }

        const studentId = studentRes.rows[0].id;
        const itemId = itemRes.rows[0].id;

        const invoiceData = {
            studentId,
            dueDate: new Date().toISOString().split('T')[0],
            items: [
                { itemId, description: 'Test Item', quantity: 1, unitPrice: 100, discount: 10 }
            ],
            scholarshipId: null,
            createdBy: null
        };

        // Simulate creation flow manually to test DB
        const invoiceNumber = `TEST-${Date.now().toString().slice(-6)}`;
        const totalAmount = 90; // 100 - 10

        console.log('Testing INSERT INTO invoices...');
        const invRes = await pool.query(
            `INSERT INTO invoices (student_id, invoice_number, total_amount, due_date, discount_amount) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [invoiceData.studentId, invoiceNumber, totalAmount, invoiceData.dueDate, 10]
        );
        const invoiceId = invRes.rows[0].id;
        console.log('Invoice created with ID:', invoiceId);

        console.log('Testing INSERT INTO invoice_details...');
        await pool.query(
            `INSERT INTO invoice_details (invoice_id, item_id, description, quantity, unit_price, discount, subtotal) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [invoiceId, itemId, 'Test Item', 1, 100, 10, 90]
        );
        console.log('Invoice details created.');
        console.log('SUCCESS: All billing tables are operational.');

    } catch (err) {
        console.error('DATABASE ERROR:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            constraint: err.constraint
        });
    } finally {
        await pool.end();
    }
}

main();
