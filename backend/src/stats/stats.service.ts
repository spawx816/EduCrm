import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class StatsService {
    constructor(@Inject(PG_POOL) private pool: Pool) { }

    async getDashboardStats() {
        const [
            revenueRes,
            leadsRes,
            studentsRes,
            pendingInvoicesRes,
            leadsByStageRes,
            programsRes,
            opExpensesRes,
            payrollRes
        ] = await Promise.all([
            // ... (queries stay the same)
            // ... I need to replace the whole block because I messed up the names in the first attempt
            // Total Revenue (Last 30 days)
            this.pool.query("SELECT SUM(amount) as total FROM payments WHERE payment_date > NOW() - INTERVAL '30 days'"),
            // New Leads (Last 7 days)
            this.pool.query("SELECT COUNT(*) as total FROM leads WHERE created_at > NOW() - INTERVAL '7 days' AND deleted_at IS NULL"),
            // Total Active Students
            this.pool.query("SELECT COUNT(*) as total FROM students WHERE deleted_at IS NULL"),
            // Pending Revenue (Unpaid Invoices)
            this.pool.query("SELECT SUM(total_amount - paid_amount) as total FROM invoices WHERE status != 'PAID'"),
            // Leads by Stage
            this.pool.query(`
                SELECT ps.name as stage, COUNT(l.id) as count
                FROM pipeline_stages ps
                LEFT JOIN leads l ON l.stage_id = ps.id AND l.deleted_at IS NULL
                GROUP BY ps.id, ps.name, ps.position
                ORDER BY ps.position
            `),
            // Students by Program
            this.pool.query(`
                SELECT ap.name as program, COUNT(e.id) as count
                FROM academic_programs ap
                LEFT JOIN academic_cohorts ac ON ac.program_id = ap.id
                LEFT JOIN enrollments e ON e.cohort_id = ac.id
                WHERE ap.deleted_at IS NULL
                GROUP BY ap.id, ap.name
            `),
            // Operational Expenses (Last 30 days)
            this.pool.query("SELECT SUM(amount) as total FROM expenses WHERE expense_date > NOW() - INTERVAL '30 days'"),
            // Teacher Payroll (Last 30 days)
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
}
