import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class StudentCardsService {
    constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

    async findAll() {
        const res = await this.pool.query(
            `SELECT sc.*, s.first_name, s.last_name, s.avatar_url
       FROM student_cards sc
       JOIN students s ON sc.student_id = s.id
       ORDER BY sc.created_at DESC`
        );
        return res.rows;
    }

    async findByStudentId(studentId: string) {
        const res = await this.pool.query(
            `SELECT sc.*, s.first_name, s.last_name, s.avatar_url
       FROM student_cards sc
       JOIN students s ON sc.student_id = s.id
       WHERE sc.student_id = $1
       ORDER BY sc.created_at DESC`,
            [studentId]
        );
        return res.rows;
    }

    async generateCard(studentId: string, invoiceId?: string) {
        // 1. Get student basic info
        const studentRes = await this.pool.query(
            'SELECT id, first_name, last_name, matricula FROM students WHERE id = $1',
            [studentId]
        );
        if (studentRes.rows.length === 0) throw new Error('Student not found');
        const student = studentRes.rows[0];

        // 2. Get active enrollment for program and cohort names
        const enrollmentRes = await this.pool.query(
            `SELECT e.id as enrollment_id, p.name as program_name, c.name as cohort_name
       FROM enrollments e
       JOIN academic_cohorts c ON e.cohort_id = c.id
       JOIN academic_programs p ON c.program_id = p.id
       WHERE e.student_id = $1 AND e.status = 'ACTIVE'
       LIMIT 1`,
            [studentId]
        );

        if (enrollmentRes.rows.length === 0) {
            // If no active enrollment found, try ANY enrollment
            const anyEnrollmentRes = await this.pool.query(
                `SELECT e.id as enrollment_id, p.name as program_name, c.name as cohort_name
           FROM enrollments e
           JOIN academic_cohorts c ON e.cohort_id = c.id
           JOIN academic_programs p ON c.program_id = p.id
           WHERE e.student_id = $1
           ORDER BY e.created_at DESC LIMIT 1`,
                [studentId]
            );
            if (anyEnrollmentRes.rows.length === 0) throw new Error('Student has no enrollments');
            enrollmentRes.rows[0] = anyEnrollmentRes.rows[0];
        }

        const { enrollment_id, program_name, cohort_name } = enrollmentRes.rows[0];

        const res = await this.pool.query(
            `INSERT INTO student_cards (
          student_id, invoice_id, enrollment_id, student_name, matricula, program_name, cohort_name
       ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                studentId,
                invoiceId || null,
                enrollment_id,
                `${student.first_name} ${student.last_name}`,
                student.matricula,
                program_name,
                cohort_name
            ]
        );

        return res.rows[0];
    }

    async updateStatus(id: string, status: string) {
        const res = await this.pool.query(
            'UPDATE student_cards SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );
        return res.rows[0];
    }
}
