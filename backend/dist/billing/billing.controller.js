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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const invoice_pdf_service_1 = require("./invoice-pdf.service");
let BillingController = class BillingController {
    constructor(billingService, pdfService) {
        this.billingService = billingService;
        this.pdfService = pdfService;
    }
    async getItems() {
        return this.billingService.getBillingItems();
    }
    async getScholarships() {
        return this.billingService.getScholarships();
    }
    async createScholarship(data) {
        return this.billingService.createScholarship(data);
    }
    async createItem(data) {
        return this.billingService.createBillingItem(data);
    }
    async getInvoices(studentId, search, status, startDate, endDate) {
        return this.billingService.getInvoices({ studentId, search, status, startDate, endDate });
    }
    async downloadPdf(id, res) {
        const buffer = await this.pdfService.generateInvoicePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    async getInvoiceItems(id) {
        return this.billingService.getInvoiceItems(id);
    }
    async createInvoice(data, req) {
        return this.billingService.createInvoice({
            ...data,
            createdBy: req?.user?.id
        });
    }
    async getPayments(invoiceId) {
        return this.billingService.getPayments(invoiceId);
    }
    async registerPayment(data) {
        return this.billingService.registerPayment(data);
    }
    async getInstructorPayments(teacherId) {
        return this.billingService.getInstructorPayments(teacherId);
    }
    async registerInstructorPayment(data) {
        return this.billingService.registerInstructorPayment(data);
    }
    async downloadInstructorPdf(id, res) {
        const buffer = await this.pdfService.generateInstructorPaymentPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=nomina-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    async voidInvoice(id) {
        return this.billingService.voidInvoice(id);
    }
    async getSuggestions(studentId) {
        return this.billingService.getInvoiceSuggestions(studentId);
    }
    async getInventoryMovements(itemId) {
        return this.billingService.getInventoryMovements(itemId);
    }
    async adjustStock(data) {
        return this.billingService.adjustStock(data);
    }
    async getExpenseCategories() {
        return this.billingService.getExpenseCategories();
    }
    async getExpenses(categoryId, startDate, endDate) {
        return this.billingService.getExpenses({ categoryId, startDate, endDate });
    }
    async createExpense(data) {
        return this.billingService.createExpense(data);
    }
    async deleteExpense(id) {
        return this.billingService.deleteExpense(id);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('items'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getItems", null);
__decorate([
    (0, common_1.Get)('scholarships'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getScholarships", null);
__decorate([
    (0, common_1.Post)('scholarships'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createScholarship", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createItem", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Get)('invoices/:id/items'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoiceItems", null);
__decorate([
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('invoiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('payments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "registerPayment", null);
__decorate([
    (0, common_1.Get)('instructor-payments'),
    __param(0, (0, common_1.Query)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInstructorPayments", null);
__decorate([
    (0, common_1.Post)('instructor-payments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "registerInstructorPayment", null);
__decorate([
    (0, common_1.Get)('instructor-payments/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "downloadInstructorPdf", null);
__decorate([
    (0, common_1.Post)('invoices/:id/void'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "voidInvoice", null);
__decorate([
    (0, common_1.Get)('suggestions/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Get)('inventory/movements'),
    __param(0, (0, common_1.Query)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInventoryMovements", null);
__decorate([
    (0, common_1.Post)('inventory/adjust'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)('expenses/categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getExpenseCategories", null);
__decorate([
    (0, common_1.Get)('expenses'),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getExpenses", null);
__decorate([
    (0, common_1.Post)('expenses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Delete)('expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "deleteExpense", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService,
        invoice_pdf_service_1.InvoicePdfService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map