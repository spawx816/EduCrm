import { Pool } from 'pg';
export declare class CalendarService {
    private readonly pool;
    constructor(pool: Pool);
    findAll(role?: string): Promise<any[]>;
    create(data: any, userId: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
}
