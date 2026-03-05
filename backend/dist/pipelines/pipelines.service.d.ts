import { Pool } from 'pg';
export declare class PipelinesService {
    private readonly pool;
    constructor(pool: Pool);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    updateStage(id: string, data: {
        name?: string;
        color?: string;
        is_won?: boolean;
        is_lost?: boolean;
    }): Promise<any>;
    deleteStage(id: string): Promise<any>;
}
