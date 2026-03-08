import { Pool } from 'pg';
export declare class BillingService {
    private pool;
    constructor(pool: Pool);
    getInvoices(filters: {
        studentId?: string;
        search?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<any[]>;
    getInvoiceById(id: string): Promise<any>;
    getInvoiceItems(invoiceId: string): Promise<any[]>;
    createInvoice(data: {
        studentId: string;
        dueDate: string;
        items: {
            itemId?: string;
            description: string;
            quantity: number;
            unitPrice: number;
            discount?: number;
            moduleId?: string;
            enrollmentId?: string;
        }[];
        scholarshipId?: string;
        createdBy?: string;
    }): Promise<any>;
    getPayments(invoiceId: string): Promise<any[]>;
    registerPayment(data: {
        invoiceId: string;
        amount: number;
        paymentMethod: string;
        reference?: string;
    }): Promise<any>;
    getBillingItems(): Promise<any[]>;
    createBillingItem(data: {
        name: string;
        description?: string;
        price: number;
        is_inventory?: boolean;
        stock_quantity?: number;
        min_stock?: number;
    }): Promise<any>;
    voidInvoice(id: string): Promise<any>;
    getInvoiceSuggestions(studentId: string): Promise<{
        enrollmentSuggestions: never[];
        suggestedDueDate: null;
    } | {
        enrollmentSuggestions: any[];
        suggestedDueDate: string;
    }>;
    getScholarships(): Promise<any[]>;
    createScholarship(data: {
        name: string;
        description: string;
        type: 'PERCENTAGE' | 'FIXED';
        value: number;
        applies_to_enrollment?: boolean;
        applies_to_monthly?: boolean;
    }): Promise<any>;
    deleteScholarship(id: string): Promise<any>;
    getInstructorPayments(teacherId?: string): Promise<any[]>;
    registerInstructorPayment(data: any): Promise<any>;
    getInventoryMovements(itemId?: string): Promise<any[]>;
    adjustStock(data: any): Promise<any>;
    getExpenseCategories(): Promise<any[]>;
    getExpenses(filters: {
        categoryId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<any[]>;
    createExpense(data: any): Promise<any>;
    deleteExpense(id: string): Promise<any>;
}
