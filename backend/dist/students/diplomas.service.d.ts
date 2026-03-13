import { Pool } from 'pg';
export declare class DiplomasService {
    private readonly pool;
    constructor(pool: Pool);
    findAll(): Promise<any[]>;
    findByStudentId(studentId: string): Promise<any[]>;
    generateDiploma(studentId: string, invoiceId?: string): Promise<any>;
    getDiplomaPdf(diplomaId: string): Promise<Buffer>;
}
