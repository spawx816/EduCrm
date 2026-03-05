import { Pool } from 'pg';
export declare class LeadsService {
    private readonly pool;
    constructor(pool: Pool);
    findAll(pipelineId?: string, stageId?: string): Promise<any[]>;
    create(leadData: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    createPublic(leadData: any): Promise<any>;
    updateStage(leadId: string, stageId: string): Promise<any>;
    remove(id: string): Promise<any>;
}
