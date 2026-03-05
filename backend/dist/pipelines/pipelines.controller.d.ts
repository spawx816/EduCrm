import { PipelinesService } from './pipelines.service';
export declare class PipelinesController {
    private readonly pipelinesService;
    constructor(pipelinesService: PipelinesService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    updateStage(id: string, data: any): Promise<any>;
    deleteStage(id: string): Promise<any>;
}
