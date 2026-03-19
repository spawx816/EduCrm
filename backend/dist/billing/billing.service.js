"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
const student_cards_service_1 = require("../students/student-cards.service");
const diplomas_service_1 = require("../students/diplomas.service");
let BillingService = class BillingService {
    constructor(pool, studentCardsService, diplomasService) {
        this.pool = pool;
        this.studentCardsService = studentCardsService;
        this.diplomasService = diplomasService;
    }
    async getInvoices(filters) {
        let query = `
            SELECT i.*, i.created_at as issue_date, s.first_name, s.last_name,
                   concepts_data.concepts
            FROM invoices i
            JOIN students s ON i.student_id = s.id
            LEFT JOIN (
                SELECT invoice_id, STRING_AGG(description, ', ') as concepts
                FROM invoice_details
                GROUP BY invoice_id
            ) concepts_data ON i.id = concepts_data.invoice_id
            WHERE 1=1
        `;
        const params = [];
        if (filters.studentId && filters.studentId.trim() !== '') {
            params.push(filters.studentId);
            query += ` AND i.student_id = $${params.length}`;
        }
        if (filters.status && filters.status !== 'ALL') {
            params.push(filters.status);
            query += ` AND i.status = $${params.length}`;
        }
        if (filters.search && filters.search.trim() !== '') {
            params.push(`%${filters.search}%`);
            query += ` AND (s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length} OR i.invoice_number ILIKE $${params.length})`;
        }
        if (filters.startDate) {
            params.push(filters.startDate);
            query += ` AND i.created_at >= $${params.length}`;
        }
        if (filters.endDate) {
            params.push(filters.endDate);
            query += ` AND i.created_at <= $${params.length}`;
        }
        query += ` ORDER BY i.created_at DESC`;
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async getInvoiceById(id) {
        const invoiceRes = await this.pool.query(`SELECT i.*, s.first_name, s.last_name, s.email, s.phone,
                    u.first_name as voided_by_first_name, u.last_name as voided_by_last_name 
             FROM invoices i 
             JOIN students s ON i.student_id = s.id 
             LEFT JOIN users u ON i.voided_by = u.id
             WHERE i.id = $1`, [id]);
        if (invoiceRes.rows.length === 0)
            return null;
        const detailsRes = await this.pool.query(`SELECT * FROM invoice_details WHERE invoice_id = $1`, [id]);
        const paymentsRes = await this.pool.query(`SELECT * FROM invoice_payments WHERE invoice_id = $1 ORDER BY created_at DESC`, [id]);
        return {
            ...invoiceRes.rows[0],
            details: detailsRes.rows,
            payments: paymentsRes.rows
        };
    }
    async getInvoiceItems(invoiceId) {
        const res = await this.pool.query('SELECT * FROM invoice_details WHERE invoice_id = $1', [invoiceId]);
        return res.rows;
    }
    async createInvoice(data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const invoiceNumber = `INV-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
            const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            const totalDiscount = data.items.reduce((sum, item) => sum + (item.discount || 0), 0);
            const totalAmount = subtotal - totalDiscount;
            const dueDate = data.dueDate || null;
            const invoiceRes = await client.query(`INSERT INTO invoices (student_id, invoice_number, total_amount, due_date, scholarship_id, discount_amount, created_by) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [data.studentId, invoiceNumber, totalAmount, dueDate, data.scholarshipId, totalDiscount, data.createdBy || null]);
            const invoiceId = invoiceRes.rows[0].id;
            for (const item of data.items) {
                const discount = item.discount || 0;
                const subtotal = (item.quantity * item.unitPrice) - discount;
                const isRealItem = item.itemId && !item.itemId.includes('ENROLL-') && !item.itemId.includes('MOD-');
                const dbItemId = isRealItem ? item.itemId : null;
                await client.query(`INSERT INTO invoice_details (invoice_id, item_id, description, quantity, unit_price, discount, subtotal, module_id, enrollment_id) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [invoiceId, dbItemId, item.description, item.quantity, item.unitPrice, discount, subtotal, item.moduleId || null, item.enrollmentId || null]);
                if (dbItemId) {
                    const itemCheck = await client.query('SELECT is_inventory FROM billing_items WHERE id = $1', [dbItemId]);
                    if (itemCheck.rows[0]?.is_inventory) {
                        await client.query(`INSERT INTO inventory_movements (item_id, type, quantity, reference_type, reference_id, notes)
                             VALUES ($1, 'OUT', $2, 'INVOICE', $3, $4)`, [dbItemId, item.quantity, invoiceId, `Venta en factura ${invoiceNumber}`]);
                        await client.query('UPDATE billing_items SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, dbItemId]);
                    }
                }
            }
            await client.query('COMMIT');
            for (const item of data.items) {
                if (item.description.toLowerCase().includes('carnet')) {
                    try {
                        await this.studentCardsService.generateCard(data.studentId, invoiceId);
                    }
                    catch (cardError) {
                        console.error('Failed to automatically generate carnet:', cardError);
                    }
                }
                const desc = item.description.toUpperCase();
                if (desc.includes('GRADUA') || desc.includes('DERECHO A GRADU')) {
                    try {
                        await this.diplomasService.generateDiploma(data.studentId, invoiceId);
                    }
                    catch (diplomaError) {
                        console.error('Failed to automatically generate diploma:', diplomaError);
                    }
                }
            }
            return invoiceRes.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getPayments(invoiceId) {
        const res = await this.pool.query('SELECT * FROM invoice_payments WHERE invoice_id = $1 ORDER BY created_at DESC', [invoiceId]);
        return res.rows;
    }
    async registerPayment(data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const invoiceRes = await client.query('SELECT total_amount, paid_amount FROM invoices WHERE id = $1', [data.invoiceId]);
            if (invoiceRes.rows.length === 0)
                throw new Error('Invoice not found');
            const newPaidAmount = parseFloat(invoiceRes.rows[0].paid_amount) + data.amount;
            const totalAmount = parseFloat(invoiceRes.rows[0].total_amount);
            const status = newPaidAmount >= totalAmount ? 'PAID' : 'PARTIAL';
            await client.query('INSERT INTO invoice_payments (invoice_id, amount, payment_method, reference) VALUES ($1, $2, $3, $4)', [data.invoiceId, data.amount, data.paymentMethod, data.reference]);
            const updatedInvoice = await client.query('UPDATE invoices SET paid_amount = $1, status = $2 WHERE id = $3 RETURNING *', [newPaidAmount, status, data.invoiceId]);
            await client.query('COMMIT');
            if (status === 'PAID') {
                try {
                    const details = await this.getInvoiceItems(data.invoiceId);
                    for (const item of details) {
                        const desc = item.description.toUpperCase();
                        if (desc.includes('GRADUA') || desc.includes('DERECHO A GRADU')) {
                            await this.diplomasService.generateDiploma(updatedInvoice.rows[0].student_id, data.invoiceId);
                        }
                    }
                }
                catch (sideEffectError) {
                    console.error('Failed to process post-payment side effects:', sideEffectError);
                }
            }
            return updatedInvoice.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getBillingItems() {
        const res = await this.pool.query('SELECT * FROM billing_items WHERE is_active = true ORDER BY is_inventory DESC, name ASC');
        return res.rows;
    }
    async createBillingItem(data) {
        const res = await this.pool.query(`INSERT INTO billing_items (name, description, price, is_inventory, stock_quantity, min_stock) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [
            data.name,
            data.description,
            data.price,
            data.is_inventory || false,
            data.stock_quantity || 0,
            data.min_stock || 0
        ]);
        return res.rows[0];
    }
    async updateBillingItem(id, data) {
        let setFields = [];
        let params = [];
        let idx = 1;
        for (const [key, value] of Object.entries(data)) {
            setFields.push(`${key} = $${idx}`);
            params.push(value);
            idx++;
        }
        if (setFields.length === 0)
            return null;
        params.push(id);
        const res = await this.pool.query(`UPDATE billing_items SET ${setFields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
        return res.rows[0];
    }
    async deleteBillingItem(id) {
        return this.updateBillingItem(id, { is_active: false });
    }
    async seedCarnets() {
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS student_cards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID NOT NULL REFERENCES students(id),
            invoice_id UUID REFERENCES invoices(id),
            enrollment_id UUID REFERENCES enrollments(id),
            student_name TEXT NOT NULL,
            matricula TEXT NOT NULL,
            program_name TEXT NOT NULL,
            cohort_name TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await this.pool.query(`
          INSERT INTO billing_items (name, price, is_active)
          VALUES ('Carnet', 250, true)
          ON CONFLICT DO NOTHING
        `);
        return { message: "Carnet seeding applied" };
    }
    async voidInvoice(id, voidedBy) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const currentRes = await client.query('SELECT status, invoice_number FROM invoices WHERE id = $1', [id]);
            if (currentRes.rows.length === 0)
                throw new Error('Invoice not found');
            if (currentRes.rows[0].status === 'VOIDED') {
                await client.query('ROLLBACK');
                return currentRes.rows[0];
            }
            const details = await client.query('SELECT item_id, quantity FROM invoice_details WHERE invoice_id = $1 AND item_id IS NOT NULL', [id]);
            for (const item of details.rows) {
                const itemCheck = await client.query('SELECT is_inventory FROM billing_items WHERE id = $1', [item.item_id]);
                if (itemCheck.rows[0]?.is_inventory) {
                    await client.query(`INSERT INTO inventory_movements (item_id, type, quantity, reference_type, reference_id, notes)
                     VALUES ($1, 'IN', $2, 'VOIDED_INVOICE', $3, $4)`, [item.item_id, item.quantity, id, `Anulación de factura ${currentRes.rows[0].invoice_number}`]);
                    await client.query('UPDATE billing_items SET stock_quantity = stock_quantity + $1 WHERE id = $2', [item.quantity, item.item_id]);
                }
            }
            const res = await client.query("UPDATE invoices SET status = 'VOIDED', voided_at = NOW(), voided_by = $2 WHERE id = $1 RETURNING *", [id, voidedBy]);
            await client.query('COMMIT');
            return res.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteInvoice(id) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const currentRes = await client.query('SELECT status, invoice_number FROM invoices WHERE id = $1', [id]);
            if (currentRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }
            if (currentRes.rows[0].status !== 'VOIDED') {
                const details = await client.query('SELECT item_id, quantity FROM invoice_details WHERE invoice_id = $1 AND item_id IS NOT NULL', [id]);
                for (const item of details.rows) {
                    const itemCheck = await client.query('SELECT is_inventory FROM billing_items WHERE id = $1', [item.item_id]);
                    if (itemCheck.rows[0]?.is_inventory) {
                        await client.query('UPDATE billing_items SET stock_quantity = stock_quantity + $1 WHERE id = $2', [item.quantity, item.item_id]);
                    }
                }
            }
            await client.query('DELETE FROM student_cards WHERE invoice_id = $1', [id]);
            await client.query('DELETE FROM invoice_payments WHERE invoice_id = $1', [id]);
            await client.query('DELETE FROM invoice_details WHERE invoice_id = $1', [id]);
            await client.query("DELETE FROM inventory_movements WHERE reference_id = $1 AND reference_type = 'INVOICE'", [id]);
            const res = await client.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [id]);
            await client.query('COMMIT');
            return res.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getInvoiceSuggestions(studentId) {
        const enrollmentsRes = await this.pool.query(`SELECT e.id as enrollment_id, e.cohort_id, e.status as enrollment_status, c.program_id, c.requires_enrollment, p.enrollment_price, p.name as program_name, p.billing_day,
                    s.id as scholarship_id, s.name as scholarship_name, s.type as scholarship_type, s.value as scholarship_value,
                    s.applies_to_enrollment, s.applies_to_monthly
             FROM enrollments e 
             JOIN academic_cohorts c ON e.cohort_id = c.id 
             JOIN academic_programs p ON c.program_id = p.id
             LEFT JOIN scholarships s ON e.scholarship_id = s.id
             WHERE e.student_id = $1 AND e.status IN ('ACTIVE', 'PENDING')`, [studentId]);
        if (enrollmentsRes.rows.length === 0)
            return { enrollmentSuggestions: [], suggestedDueDate: null };
        const today = new Date();
        const firstEnrollment = enrollmentsRes.rows[0];
        const billingDay = firstEnrollment.billing_day || 5;
        const suggestedDueDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
        if (today.getDate() >= billingDay) {
            suggestedDueDate.setMonth(suggestedDueDate.getMonth() + 1);
        }
        const formattedSuggestedDueDate = suggestedDueDate.toISOString().split('T')[0];
        const enrollmentSuggestions = [];
        for (const enrollment of enrollmentsRes.rows) {
            const { enrollment_id, cohort_id, program_id, enrollment_price, program_name, scholarship_id, scholarship_name, scholarship_type, scholarship_value, requires_enrollment, applies_to_enrollment, applies_to_monthly } = enrollment;
            const calculateDiscount = (basePrice, itemType) => {
                if (!scholarship_id)
                    return 0;
                if (itemType === 'ENROLLMENT' && !applies_to_enrollment)
                    return 0;
                if (itemType === 'MONTHLY' && !applies_to_monthly)
                    return 0;
                if (scholarship_type === 'PERCENTAGE') {
                    return (basePrice * scholarship_value) / 100;
                }
                return Math.min(basePrice, scholarship_value);
            };
            const invoicedEnrollmentRes = await this.pool.query(`SELECT i.status, i.paid_amount, i.total_amount 
                 FROM invoice_details id
                 JOIN invoices i ON id.invoice_id = i.id
                 WHERE i.student_id = $1 AND i.status != 'VOIDED'
                 AND (id.enrollment_id = $2 OR (id.enrollment_id IS NULL AND id.description ILIKE $3))`, [studentId, enrollment_id, `%Inscripción%${program_name}%`]);
            const isEnrollmentInvoiced = invoicedEnrollmentRes.rows.length > 0;
            const isEnrollmentPaid = !requires_enrollment || (isEnrollmentInvoiced && (invoicedEnrollmentRes.rows[0].status === 'PAID' ||
                parseFloat(invoicedEnrollmentRes.rows[0].paid_amount) >= parseFloat(invoicedEnrollmentRes.rows[0].total_amount)));
            const allModulesRes = await this.pool.query(`SELECT id, name, price, order_index 
                 FROM academic_modules 
                 WHERE program_id = $1 AND deleted_at IS NULL 
                 ORDER BY order_index ASC, name ASC`, [program_id]);
            const invoicedModulesRes = await this.pool.query(`SELECT id.description, id.module_id
                 FROM invoice_details id
                 JOIN invoices i ON id.invoice_id = i.id
                 WHERE i.student_id = $1 AND i.status != 'VOIDED' AND id.item_id IS NULL AND id.description NOT ILIKE '%Inscripción%'
                 AND (id.enrollment_id = $2 OR (id.enrollment_id IS NULL AND id.description ILIKE $3))`, [studentId, enrollment_id, `%${program_name}%`]);
            const invoicedModules = invoicedModulesRes.rows;
            const uninvoicedModules = allModulesRes.rows.filter(m => {
                return !invoicedModules.some(inv => {
                    if (inv.module_id === m.id)
                        return true;
                    const invDesc = inv.description.toLowerCase().trim();
                    const mName = m.name.toLowerCase().trim();
                    return invDesc.includes(mName) || mName.includes(invDesc);
                });
            }).map(m => {
                const finalModulePrice = parseFloat(m.price) || 0;
                const moduleDiscount = calculateDiscount(finalModulePrice, 'MONTHLY');
                return {
                    id: m.id,
                    name: m.name,
                    price: finalModulePrice,
                    discount: moduleDiscount
                };
            });
            let currentSuggestion = {
                enrollmentId: enrollment_id,
                programName: program_name,
                enrollmentFee: null,
                suggestedModule: uninvoicedModules.length > 0 ? uninvoicedModules[0] : null,
                uninvoicedModules: uninvoicedModules,
                addons: [],
                allModules: allModulesRes.rows,
                isEnrollmentPaid,
                isEnrollmentInvoiced,
                scholarship: scholarship_id ? { id: scholarship_id, name: scholarship_name } : null
            };
            if (!isEnrollmentInvoiced && parseFloat(enrollment_price) > 0 && requires_enrollment) {
                const finalEnrollmentPrice = parseFloat(enrollment_price) || 0;
                const enrollmentDiscount = calculateDiscount(finalEnrollmentPrice, 'ENROLLMENT');
                currentSuggestion.enrollmentFee = {
                    name: `Inscripción - ${program_name}`,
                    price: finalEnrollmentPrice,
                    discount: enrollmentDiscount
                };
            }
            else if (isEnrollmentPaid) {
                if (currentSuggestion.suggestedModule) {
                    const addonsRes = await this.pool.query(`SELECT bi.* 
                         FROM academic_module_addons ama
                         JOIN billing_items bi ON ama.item_id = bi.id
                         WHERE ama.module_id = $1`, [currentSuggestion.suggestedModule.id]);
                    currentSuggestion.addons = addonsRes.rows;
                }
            }
            else if (isEnrollmentInvoiced && !isEnrollmentPaid) {
                currentSuggestion.error = `Debe pagar la inscripción de ${program_name} antes de facturar módulos.`;
            }
            enrollmentSuggestions.push(currentSuggestion);
        }
        return {
            enrollmentSuggestions,
            suggestedDueDate: formattedSuggestedDueDate
        };
    }
    async getScholarships() {
        const res = await this.pool.query('SELECT * FROM scholarships ORDER BY name ASC');
        return res.rows;
    }
    async createScholarship(data) {
        const res = await this.pool.query('INSERT INTO scholarships (name, description, type, value, applies_to_enrollment, applies_to_monthly) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [
            data.name,
            data.description,
            data.type,
            data.value,
            data.applies_to_enrollment ?? true,
            data.applies_to_monthly ?? true
        ]);
        return res.rows[0];
    }
    async deleteScholarship(id) {
        const res = await this.pool.query('DELETE FROM scholarships WHERE id = $1 RETURNING *', [id]);
        return res.rows[0];
    }
    async getInstructorPayments(teacherId, year) {
        let query = 'SELECT ip.*, u.first_name, u.last_name FROM instructor_payments ip JOIN users u ON ip.teacher_id = u.id WHERE 1=1';
        const params = [];
        if (teacherId) {
            params.push(teacherId);
            query += ` AND ip.teacher_id = $${params.length}`;
        }
        if (year) {
            params.push(year);
            query += ` AND EXTRACT(YEAR FROM ip.payment_date) = $${params.length}`;
        }
        query += ' ORDER BY ip.payment_date DESC';
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async registerInstructorPayment(data) {
        const paymentDate = data.date || null;
        const res = await this.pool.query(`INSERT INTO instructor_payments (teacher_id, amount, payment_method, reference_number, notes, payment_date)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW())) RETURNING *`, [data.teacherId, data.amount, data.paymentMethod, data.referenceNumber, data.notes, paymentDate]);
        return res.rows[0];
    }
    async deleteInstructorPayment(id) {
        const res = await this.pool.query('DELETE FROM instructor_payments WHERE id = $1 RETURNING *', [id]);
        return res.rows[0];
    }
    async voidInstructorPayment(id) {
        const res = await this.pool.query("UPDATE instructor_payments SET status = 'VOIDED', updated_at = NOW() WHERE id = $1 RETURNING *", [id]);
        return res.rows[0];
    }
    async getInventoryMovements(itemId) {
        const query = itemId
            ? 'SELECT im.*, bi.name as item_name FROM inventory_movements im JOIN billing_items bi ON im.item_id = bi.id WHERE im.item_id = $1 ORDER BY im.created_at DESC'
            : 'SELECT im.*, bi.name as item_name FROM inventory_movements im JOIN billing_items bi ON im.item_id = bi.id ORDER BY im.created_at DESC';
        const res = await this.pool.query(query, itemId ? [itemId] : []);
        return res.rows;
    }
    async adjustStock(data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`INSERT INTO inventory_movements (item_id, type, quantity, reference_type, notes)
                 VALUES ($1, $2, $3, 'MANUAL_ADJUSTMENT', $4)`, [data.itemId, data.type, data.quantity, data.notes]);
            const factor = data.type === 'IN' ? 1 : -1;
            const res = await client.query('UPDATE billing_items SET stock_quantity = stock_quantity + $1 WHERE id = $2 RETURNING *', [data.quantity * factor, data.itemId]);
            await client.query('COMMIT');
            return res.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getExpenseCategories() {
        const res = await this.pool.query('SELECT * FROM expense_categories ORDER BY name ASC');
        return res.rows;
    }
    async getExpenses(filters) {
        let query = 'SELECT e.*, c.name as category_name FROM expenses e JOIN expense_categories c ON e.category_id = c.id WHERE 1=1';
        const params = [];
        if (filters.categoryId) {
            params.push(filters.categoryId);
            query += ` AND e.category_id = $${params.length}`;
        }
        if (filters.startDate) {
            params.push(filters.startDate);
            query += ` AND e.expense_date >= $${params.length}`;
        }
        if (filters.endDate) {
            params.push(filters.endDate);
            query += ` AND e.expense_date <= $${params.length}`;
        }
        query += ' ORDER BY e.expense_date DESC';
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async createExpense(data) {
        const expenseDate = data.expenseDate || null;
        const res = await this.pool.query(`INSERT INTO expenses (category_id, amount, expense_date, description, payment_method, reference_number)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [data.categoryId, data.amount, expenseDate, data.description, data.paymentMethod, data.referenceNumber]);
        return res.rows[0];
    }
    async deleteExpense(id) {
        const res = await this.pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
        return res.rows[0];
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => student_cards_service_1.StudentCardsService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => diplomas_service_1.DiplomasService))),
    __metadata("design:paramtypes", [pg_1.Pool,
        student_cards_service_1.StudentCardsService,
        diplomas_service_1.DiplomasService])
], BillingService);
//# sourceMappingURL=billing.service.js.map