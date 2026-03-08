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
        suggestedModule: null;
        addons: never[];
        enrollmentFee: null;
        scholarship?: undefined;
        isEnrollmentPaid?: undefined;
        isEnrollmentInvoiced?: undefined;
        suggestedDueDate?: undefined;
        error?: undefined;
        isModuleInvoiced?: undefined;
        totalDiscount?: undefined;
    } | {
        suggestedModule: null;
        addons: never[];
        enrollmentFee: {
            name: string;
            price: number;
            discount: number;
        };
        scholarship: {
            id: any;
            name: any;
        } | null;
        isEnrollmentPaid: boolean;
        isEnrollmentInvoiced: boolean;
        suggestedDueDate: string;
        error?: undefined;
        isModuleInvoiced?: undefined;
        totalDiscount?: undefined;
    } | {
        suggestedModule: null;
        addons: never[];
        enrollmentFee: null;
        isEnrollmentPaid: boolean;
        isEnrollmentInvoiced: boolean;
        error: string;
        suggestedDueDate: string;
        scholarship?: undefined;
        isModuleInvoiced?: undefined;
        totalDiscount?: undefined;
    } | {
        suggestedModule: null;
        addons: never[];
        enrollmentFee: null;
        isEnrollmentPaid: boolean;
        isEnrollmentInvoiced: boolean;
        suggestedDueDate: string;
        scholarship?: undefined;
        error?: undefined;
        isModuleInvoiced?: undefined;
        totalDiscount?: undefined;
    } | {
        suggestedModule: null;
        addons: never[];
        enrollmentFee: null;
        isModuleInvoiced: boolean;
        isEnrollmentPaid: boolean;
        isEnrollmentInvoiced: boolean;
        suggestedDueDate: string;
        scholarship?: undefined;
        error?: undefined;
        totalDiscount?: undefined;
    } | {
        suggestedModule: {
            id: any;
            name: any;
            price: number;
            discount: number;
        };
        addons: any[];
        enrollmentFee: null;
        scholarship: {
            id: any;
            name: any;
        } | null;
        totalDiscount: number;
        isModuleInvoiced: boolean;
        isEnrollmentPaid: boolean;
        isEnrollmentInvoiced: boolean;
        suggestedDueDate: string;
        error?: undefined;
    }>;
    getScholarships(): Promise<any[]>;
    createScholarship(data: {
        name: string;
        description: string;
        type: 'PERCENTAGE' | 'FIXED';
        value: number;
    }): Promise<any>;
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
