"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
let StatsService = class StatsService {
    constructor(pool) {
        this.pool = pool;
    }
    async getDashboardStats() {
        const [revenueRes, leadsRes, studentsRes, pendingInvoicesRes, leadsByStageRes, programsRes, opExpensesRes, payrollRes] = await Promise.all([
            this.pool.query("SELECT SUM(amount) as total FROM invoice_payments WHERE created_at > NOW() - INTERVAL '30 days'"),
            this.pool.query("SELECT COUNT(*) as total FROM leads WHERE created_at > NOW() - INTERVAL '7 days' AND deleted_at IS NULL"),
            this.pool.query("SELECT COUNT(*) as total FROM students WHERE deleted_at IS NULL"),
            this.pool.query("SELECT SUM(total_amount - paid_amount) as total FROM invoices WHERE status != 'PAID'"),
            this.pool.query(`
                SELECT ps.name as stage, COUNT(l.id) as count
                FROM pipeline_stages ps
                LEFT JOIN leads l ON l.stage_id = ps.id AND l.deleted_at IS NULL
                GROUP BY ps.id, ps.name, ps.position
                ORDER BY ps.position
            `),
            this.pool.query(`
                SELECT ap.name as program, COUNT(e.id) as count
                FROM academic_programs ap
                LEFT JOIN academic_cohorts ac ON ac.program_id = ap.id
                LEFT JOIN enrollments e ON e.cohort_id = ac.id
                WHERE ap.deleted_at IS NULL
                GROUP BY ap.id, ap.name
            `),
            this.pool.query("SELECT SUM(amount) as total FROM expenses WHERE expense_date > NOW() - INTERVAL '30 days'"),
            this.pool.query("SELECT SUM(amount) as total FROM instructor_payments WHERE payment_date > NOW() - INTERVAL '30 days'")
        ]);
        const totalRevenue = parseFloat(revenueRes.rows[0].total || 0);
        const totalExpenses = parseFloat(opExpensesRes.rows[0].total || 0) + parseFloat(payrollRes.rows[0].total || 0);
        return {
            summary: {
                revenue30d: totalRevenue,
                totalExpenses: totalExpenses,
                netProfit: totalRevenue - totalExpenses,
                newLeads7d: parseInt(leadsRes.rows[0].total || 0),
                totalStudents: parseInt(studentsRes.rows[0].total || 0),
                pendingRevenue: parseFloat(pendingInvoicesRes.rows[0].total || 0),
            },
            leadsByStage: leadsByStageRes.rows,
            studentsByProgram: programsRes.rows
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], StatsService);
//# sourceMappingURL=stats.service.js.map