import { Pool } from 'pg';
export declare class StatsService {
    private pool;
    constructor(pool: Pool);
    getDashboardStats(): Promise<{
        summary: {
            revenue30d: number;
            totalExpenses: number;
            netProfit: number;
            newLeads7d: number;
            totalStudents: number;
            pendingRevenue: number;
        };
        leadsByStage: any[];
        studentsByProgram: any[];
    }>;
}
