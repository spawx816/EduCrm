import { Controller, Get, Post, Body, Query, Param, Res, Delete, UseGuards, Req } from '@nestjs/common';
import { BillingService } from './billing.service';
import { InvoicePdfService } from './invoice-pdf.service';
import type { Response } from 'express';

@Controller('billing')
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        private readonly pdfService: InvoicePdfService
    ) { }

    @Get('items')
    async getItems() {
        return this.billingService.getBillingItems();
    }

    @Get('scholarships')
    async getScholarships() {
        return this.billingService.getScholarships();
    }

    @Post('scholarships')
    async createScholarship(@Body() data: any) {
        return this.billingService.createScholarship(data);
    }

    @Post('items')
    async createItem(@Body() data: { name: string; description?: string; price: number }) {
        return this.billingService.createBillingItem(data);
    }

    @Get('invoices')
    async getInvoices(
        @Query('studentId') studentId?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.billingService.getInvoices({ studentId, search, status, startDate, endDate });
    }

    @Get('invoices/:id/pdf')
    async downloadPdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.pdfService.generateInvoicePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('invoices/:id/items')
    async getInvoiceItems(@Param('id') id: string) {
        return this.billingService.getInvoiceItems(id);
    }

    @Post('invoices')
    async createInvoice(@Body() data: any, @Req() req: any) {
        return this.billingService.createInvoice({
            ...data,
            createdBy: req?.user?.id
        });
    }

    @Get('payments')
    async getPayments(@Query('invoiceId') invoiceId: string) {
        return this.billingService.getPayments(invoiceId);
    }

    @Post('payments')
    async registerPayment(@Body() data: any) {
        return this.billingService.registerPayment(data);
    }

    // Instructor Payroll
    @Get('instructor-payments')
    async getInstructorPayments(@Query('teacherId') teacherId?: string) {
        return this.billingService.getInstructorPayments(teacherId);
    }

    @Post('instructor-payments')
    async registerInstructorPayment(@Body() data: any) {
        return this.billingService.registerInstructorPayment(data);
    }
    @Get('instructor-payments/:id/pdf')
    async downloadInstructorPdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.pdfService.generateInstructorPaymentPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=nomina-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    @Post('invoices/:id/void')
    async voidInvoice(@Param('id') id: string) {
        return this.billingService.voidInvoice(id);
    }

    @Get('suggestions/:studentId')
    async getSuggestions(@Param('studentId') studentId: string) {
        return this.billingService.getInvoiceSuggestions(studentId);
    }

    // Inventory Management
    @Get('inventory/movements')
    async getInventoryMovements(@Query('itemId') itemId?: string) {
        return this.billingService.getInventoryMovements(itemId);
    }

    @Post('inventory/adjust')
    async adjustStock(@Body() data: any) {
        return this.billingService.adjustStock(data);
    }

    // Expense Management
    @Get('expenses/categories')
    async getExpenseCategories() {
        return this.billingService.getExpenseCategories();
    }

    @Get('expenses')
    async getExpenses(
        @Query('categoryId') categoryId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.billingService.getExpenses({ categoryId, startDate, endDate });
    }

    @Post('expenses')
    async createExpense(@Body() data: any) {
        return this.billingService.createExpense(data);
    }

    @Delete('expenses/:id')
    async deleteExpense(@Param('id') id: string) {
        return this.billingService.deleteExpense(id);
    }
}
