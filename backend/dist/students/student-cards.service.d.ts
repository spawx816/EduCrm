import { Pool } from 'pg';
export declare class StudentCardsService {
    private readonly pool;
    constructor(pool: Pool);
    findAll(): Promise<any[]>;
    findByStudentId(studentId: string): Promise<any[]>;
    generateCard(studentId: string, invoiceId?: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
}
