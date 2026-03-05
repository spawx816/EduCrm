import { Pool } from 'pg';
import { StorageService } from '../common/storage.service';
export declare class LeadAttachmentsService {
    private readonly pool;
    private readonly storageService;
    constructor(pool: Pool, storageService: StorageService);
    addAttachment(leadId: string, file: any): Promise<any>;
    findByLead(leadId: string): Promise<any[]>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getFilePath(filename: string): string;
}
