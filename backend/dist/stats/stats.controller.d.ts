import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
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
