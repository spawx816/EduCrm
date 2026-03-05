import { Pool } from 'pg';
export declare class InvoicePdfService {
    private pool;
    constructor(pool: Pool);
    generateInvoicePdf(invoiceId: string): Promise<Buffer>;
    generateInstructorPaymentPdf(paymentId: string): Promise<Buffer>;
}
