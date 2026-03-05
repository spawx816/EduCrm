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
exports.InvoicePdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require('pdfkit');
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
let InvoicePdfService = class InvoicePdfService {
    constructor(pool) {
        this.pool = pool;
    }
    async generateInvoicePdf(invoiceId) {
        const invoiceRes = await this.pool.query(`
      SELECT i.*, s.first_name, s.last_name, s.email, s.phone as student_phone, s.matricula,
             u.first_name as cajero_first, u.last_name as cajero_last
      FROM invoices i
      JOIN students s ON i.student_id = s.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = $1
    `, [invoiceId]);
        if (invoiceRes.rows.length === 0) {
            throw new Error('Invoice not found');
        }
        const invoice = invoiceRes.rows[0];
        const settingsRes = await this.pool.query('SELECT * FROM company_settings LIMIT 1');
        const settings = settingsRes.rows[0] || {
            company_name: 'EduCRM Academy',
            primary_color: '#2563eb',
            logo_url: null,
            address: '',
            phone: '',
            website: '',
            invoice_header: 'COMPROBANTE DE PAGO',
            invoice_footer: '¡Gracias por su preferencia!'
        };
        const detailsRes = await this.pool.query('SELECT * FROM invoice_details WHERE invoice_id = $1', [invoiceId]);
        const details = detailsRes.rows;
        const paymentsRes = await this.pool.query('SELECT * FROM invoice_payments WHERE invoice_id = $1 ORDER BY created_at ASC', [invoiceId]);
        const payments = paymentsRes.rows;
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: [226, 800],
                margin: 10
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            const primaryColor = settings.primary_color || '#000000';
            const width = 206;
            let currentY = 10;
            if (settings.logo_url) {
                try {
                    const logoPath = require('path').join(process.cwd(), settings.logo_url);
                    if (require('fs').existsSync(logoPath)) {
                        const img = doc.openImage(logoPath);
                        const logoWidth = 140;
                        const scaleFactor = logoWidth / img.width;
                        const logoHeight = img.height * scaleFactor;
                        doc.image(img, (226 - logoWidth) / 2, currentY, { width: logoWidth });
                        currentY += logoHeight + 10;
                    }
                }
                catch (e) {
                    console.error('Error loading logo for PDF:', e);
                }
            }
            doc.fillColor('black').fontSize(10).font('Helvetica-Bold').text(settings.company_name, 10, currentY, { align: 'center', width });
            currentY = doc.y + 4;
            doc.fontSize(7).font('Helvetica');
            if (settings.address) {
                doc.text(settings.address, 10, currentY, { align: 'center', width });
                currentY = doc.y + 2;
            }
            if (settings.phone || settings.website) {
                doc.text(`${settings.phone} ${settings.website}`, 10, currentY, { align: 'center', width });
                currentY = doc.y + 4;
            }
            doc.moveTo(10, currentY).lineTo(216, currentY).lineWidth(0.5).stroke();
            currentY += 8;
            doc.fontSize(8).font('Helvetica-Bold').text(settings.invoice_header || 'FACTURA', 10, currentY, { align: 'center', width });
            currentY = doc.y + 4;
            doc.text(`No: ${invoice.invoice_number}`, 10, currentY, { align: 'center', width });
            currentY = doc.y + 4;
            doc.fontSize(7).font('Helvetica').text(`Fecha: ${new Date(invoice.issue_date).toLocaleDateString()}`, 10, currentY, { align: 'center', width });
            currentY = doc.y + 8;
            doc.moveTo(10, currentY).lineTo(216, currentY).dash(2, { space: 2 }).stroke();
            doc.undash();
            currentY += 8;
            doc.font('Helvetica-Bold').text('ESTUDIANTE:', 10, currentY);
            currentY = doc.y + 2;
            doc.font('Helvetica').text(`${invoice.first_name} ${invoice.last_name}`, 10, currentY);
            currentY = doc.y + 2;
            doc.fontSize(6).fillColor('gray').text(`ID: ${invoice.matricula || 'N/A'}`, 10, currentY);
            currentY = doc.y + 4;
            const cajeroName = invoice.cajero_first ? `${invoice.cajero_first} ${invoice.cajero_last || ''}`.trim() : 'Sistema';
            doc.text(`Atendido por: ${cajeroName}`, 10, currentY);
            currentY = doc.y + 8;
            doc.fontSize(7).fillColor('black');
            doc.moveTo(10, currentY).lineTo(216, currentY).dash(2, { space: 2 }).stroke();
            doc.undash();
            currentY += 8;
            doc.font('Helvetica-Bold').text('CANT', 10, currentY);
            doc.text('DESC', 35, currentY);
            doc.text('TOTAL', 170, currentY, { align: 'right', width: 46 });
            currentY = doc.y + 4;
            details.forEach(item => {
                doc.font('Helvetica').text(item.quantity.toString(), 10, currentY);
                const startY = currentY;
                doc.text(item.description, 35, currentY, { width: 130 });
                const endY = doc.y;
                doc.text(`$${parseFloat(item.subtotal).toLocaleString()}`, 170, startY, { align: 'right', width: 46 });
                currentY = Math.max(endY, startY + 10) + 4;
            });
            currentY += 4;
            doc.moveTo(10, currentY).lineTo(216, currentY).dash(2, { space: 2 }).stroke();
            doc.undash();
            currentY += 8;
            doc.font('Helvetica-Bold').text('TOTAL:', 10, currentY);
            doc.text(`RD$${parseFloat(invoice.total_amount).toLocaleString()}`, 150, currentY, { align: 'right', width: 66 });
            currentY = doc.y + 4;
            doc.font('Helvetica').text('PAGADO:', 10, currentY);
            doc.text(`RD$${parseFloat(invoice.paid_amount).toLocaleString()}`, 150, currentY, { align: 'right', width: 66 });
            currentY = doc.y + 4;
            const remaining = parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount);
            if (remaining > 0) {
                doc.font('Helvetica-Bold').text('PENDIENTE:', 10, currentY);
                doc.text(`RD$${remaining.toLocaleString()}`, 150, currentY, { align: 'right', width: 66 });
                currentY = doc.y + 4;
            }
            if (payments.length > 0) {
                currentY += 6;
                doc.moveTo(10, currentY).lineTo(216, currentY).dash(2, { space: 2 }).stroke();
                doc.undash();
                currentY += 8;
                doc.font('Helvetica-Bold').fontSize(7).text('HISTORIAL DE PAGOS', 10, currentY, { align: 'center', width });
                currentY = doc.y + 6;
                payments.forEach(p => {
                    const date = new Date(p.created_at).toLocaleDateString();
                    doc.font('Helvetica').text(`${date} - ${p.payment_method}`, 10, currentY);
                    doc.text(`RD$${parseFloat(p.amount).toLocaleString()}`, 150, currentY, { align: 'right', width: 66 });
                    currentY = doc.y + 3;
                });
            }
            currentY += 15;
            doc.moveTo(10, currentY).lineTo(216, currentY).stroke();
            currentY += 10;
            doc.fontSize(7).font('Helvetica-Oblique').text(settings.invoice_footer, 10, currentY, { align: 'center', width });
            doc.end();
        });
    }
    async generateInstructorPaymentPdf(paymentId) {
        const paymentRes = await this.pool.query(`
            SELECT ip.*, u.first_name, u.last_name, u.email 
            FROM instructor_payments ip
            JOIN users u ON ip.teacher_id = u.id
            WHERE ip.id = $1
        `, [paymentId]);
        if (paymentRes.rows.length === 0) {
            throw new Error('Payment not found');
        }
        const payment = paymentRes.rows[0];
        const settingsRes = await this.pool.query('SELECT * FROM company_settings LIMIT 1');
        const settings = settingsRes.rows[0] || {
            company_name: 'EduCRM Academy',
            primary_color: '#2563eb',
            logo_url: null,
            address: '',
            phone: '',
            website: '',
            invoice_header: 'COMPROBANTE DE PAGO',
            invoice_footer: '¡Gracias por su preferencia!'
        };
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: [226, 600],
                margin: 10
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            const width = 206;
            let currentY = 10;
            if (settings.logo_url) {
                try {
                    const logoPath = require('path').join(process.cwd(), settings.logo_url);
                    if (require('fs').existsSync(logoPath)) {
                        const img = doc.openImage(logoPath);
                        const logoWidth = 140;
                        const scaleFactor = logoWidth / img.width;
                        const logoHeight = img.height * scaleFactor;
                        doc.image(img, (226 - logoWidth) / 2, currentY, { width: logoWidth });
                        currentY += logoHeight + 10;
                    }
                }
                catch (e) {
                    console.error('Error loading logo for PDF:', e);
                }
            }
            doc.fillColor('black').fontSize(10).font('Helvetica-Bold').text(settings.company_name, 10, currentY, { align: 'center', width });
            currentY = doc.y + 4;
            doc.fontSize(7).font('Helvetica');
            if (settings.address) {
                doc.text(settings.address, 10, currentY, { align: 'center', width });
                currentY = doc.y + 2;
            }
            if (settings.phone || settings.website) {
                doc.text(`${settings.phone} ${settings.website}`, 10, currentY, { align: 'center', width });
                currentY = doc.y + 4;
            }
            doc.moveTo(10, currentY).lineTo(216, currentY).lineWidth(0.5).stroke();
            currentY += 8;
            doc.fontSize(8).font('Helvetica-Bold').text('NÓMINA DOCENTE', 10, currentY, { align: 'center', width });
            currentY = doc.y + 4;
            doc.text(`Ref: ${payment.reference_number || payment.id.substring(0, 8).toUpperCase()}`, 10, currentY, { align: 'center', width });
            currentY = doc.y + 4;
            doc.fontSize(7).font('Helvetica').text(`Fecha Pago: ${new Date(payment.payment_date).toLocaleDateString()}`, 10, currentY, { align: 'center', width });
            currentY = doc.y + 8;
            doc.moveTo(10, currentY).lineTo(216, currentY).dash(2, { space: 2 }).stroke();
            doc.undash();
            currentY += 8;
            doc.font('Helvetica-Bold').text('DOCENTE:', 10, currentY);
            currentY = doc.y + 2;
            doc.font('Helvetica').text(`${payment.first_name} ${payment.last_name}`, 10, currentY);
            currentY = doc.y + 4;
            doc.moveTo(10, currentY).lineTo(216, currentY).dash(2, { space: 2 }).stroke();
            doc.undash();
            currentY += 8;
            doc.font('Helvetica-Bold').text('DESCRIPCIÓN', 10, currentY);
            doc.text('MONTO', 150, currentY, { align: 'right', width: 66 });
            currentY = doc.y + 8;
            const conceptText = payment.notes ? `Honorarios: ${payment.notes}` : 'Honorarios Docentes';
            doc.font('Helvetica').text(conceptText, 10, currentY, { width: 130 });
            doc.text(`RD$${parseFloat(payment.amount).toLocaleString()}`, 150, currentY, { align: 'right', width: 66 });
            currentY = doc.y + 8;
            doc.moveTo(10, currentY).lineTo(216, currentY).dash(2, { space: 2 }).stroke();
            doc.undash();
            currentY += 8;
            doc.font('Helvetica-Bold').text('MÉTODO DE PAGO:', 10, currentY);
            doc.font('Helvetica').text(payment.payment_method, 150, currentY, { align: 'right', width: 66 });
            currentY += 15;
            doc.font('Helvetica-Bold').text('TOTAL PAGADO:', 10, currentY);
            doc.text(`RD$${parseFloat(payment.amount).toLocaleString()}`, 150, currentY, { align: 'right', width: 66 });
            currentY += 15;
            currentY += 15;
            doc.moveTo(10, currentY).lineTo(216, currentY).stroke();
            currentY += 10;
            doc.fontSize(7).font('Helvetica-Oblique').text('Comprobante de nómina/honorarios.', 10, currentY, { align: 'center', width });
            doc.end();
        });
    }
};
exports.InvoicePdfService = InvoicePdfService;
exports.InvoicePdfService = InvoicePdfService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], InvoicePdfService);
//# sourceMappingURL=invoice-pdf.service.js.map