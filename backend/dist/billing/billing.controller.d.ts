import { BillingService } from './billing.service';
import { InvoicePdfService } from './invoice-pdf.service';
import type { Response } from 'express';
export declare class BillingController {
    private readonly billingService;
    private readonly pdfService;
    constructor(billingService: BillingService, pdfService: InvoicePdfService);
    getItems(): Promise<any[]>;
    getScholarships(): Promise<any[]>;
    createScholarship(data: any): Promise<any>;
    deleteScholarship(id: string): Promise<any>;
    createItem(data: {
        name: string;
        description?: string;
        price: number;
    }): Promise<any>;
    getInvoices(studentId?: string, search?: string, status?: string, startDate?: string, endDate?: string): Promise<any[]>;
    downloadPdf(id: string, res: Response): Promise<void>;
    getInvoiceItems(id: string): Promise<any[]>;
    createInvoice(data: any, req: any): Promise<any>;
    getPayments(invoiceId: string): Promise<any[]>;
    registerPayment(data: any): Promise<any>;
    getInstructorPayments(teacherId?: string): Promise<any[]>;
    registerInstructorPayment(data: any): Promise<any>;
    downloadInstructorPdf(id: string, res: Response): Promise<void>;
    voidInvoice(id: string): Promise<any>;
    getSuggestions(studentId: string): Promise<{
        enrollmentSuggestions: never[];
        suggestedDueDate: null;
    } | {
        enrollmentSuggestions: any[];
        suggestedDueDate: string;
    }>;
    getInventoryMovements(itemId?: string): Promise<any[]>;
    adjustStock(data: any): Promise<any>;
    getExpenseCategories(): Promise<any[]>;
    getExpenses(categoryId?: string, startDate?: string, endDate?: string): Promise<any[]>;
    createExpense(data: any): Promise<any>;
    deleteExpense(id: string): Promise<any>;
}
