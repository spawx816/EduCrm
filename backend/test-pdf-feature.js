const axios = require('axios');
const fs = require('fs');

async function testPdf() {
    try {
        // 1. Get student
        const students = await axios.get('http://localhost:3000/students');
        const student = students.data[0];
        console.log('Using student:', student.first_name);

        // 2. Get billing item
        const items = await axios.get('http://localhost:3000/billing/items');
        const item = items.data[0];
        console.log('Using item:', item.name);

        // 3. Create invoice
        const invoiceData = {
            studentId: student.id,
            dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            items: [
                { billingItemId: item.id, quantity: 1, unitPrice: item.price, description: item.name }
            ]
        };
        const invoiceRes = await axios.post('http://localhost:3000/billing/invoices', invoiceData);
        const invoiceId = invoiceRes.data.id;
        console.log('Invoice created:', invoiceId);

        // 4. Download PDF
        const pdfRes = await axios.get(`http://localhost:3000/billing/invoices/${invoiceId}/pdf`, {
            responseType: 'arraybuffer'
        });

        fs.writeFileSync('test-invoice.pdf', pdfRes.data);
        console.log('PDF saved to test-invoice.pdf, size:', pdfRes.data.length, 'bytes');
    } catch (err) {
        console.error('Error during test:', err.response?.data || err.message);
    }
}

testPdf();
