import { LeadsService } from './leads.service';
import { LeadAttachmentsService } from './lead-attachments.service';
export declare class LeadsController {
    private readonly leadsService;
    private readonly attachmentsService;
    constructor(leadsService: LeadsService, attachmentsService: LeadAttachmentsService);
    findAll(pipelineId?: string, stageId?: string): Promise<any[]>;
    create(leadData: any): Promise<any>;
    createPublic(leadData: any): Promise<any>;
    updateStage(id: string, stageId: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
    addAttachment(id: string, file: any): Promise<any>;
    getAttachments(id: string): Promise<any[]>;
    removeAttachment(id: string): Promise<{
        success: boolean;
    }>;
    downloadAttachment(filename: string, res: any): Promise<any>;
}
