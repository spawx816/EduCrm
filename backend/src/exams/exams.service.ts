import { Injectable, Inject } from '@nestjs/common';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';

@Injectable()
export class ExamsService {
    constructor(@Inject(PG_POOL) private pool: Pool) { }

    // --- Exams CRUD ---

    async createExam(data: { module_id: string; title: string; description?: string; time_limit_minutes?: number; passing_score?: number; created_by: string }) {
        const res = await this.pool.query(
            `INSERT INTO exams (module_id, title, description, time_limit_minutes, passing_score, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [data.module_id, data.title, data.description, data.time_limit_minutes || 60, data.passing_score || 60, data.created_by]
        );
        return res.rows[0];
    }

    async getModuleExams(moduleId: string) {
        const res = await this.pool.query(
            'SELECT * FROM exams WHERE module_id = $1 ORDER BY created_at DESC',
            [moduleId]
        );
        return res.rows;
    }

    async getExamDetail(examId: string) {
        const examRes = await this.pool.query('SELECT * FROM exams WHERE id = $1', [examId]);
        if (examRes.rows.length === 0) return null;

        const questionsRes = await this.pool.query(
            'SELECT * FROM exam_questions WHERE exam_id = $1 ORDER BY order_index ASC',
            [examId]
        );

        const questions = questionsRes.rows;
        for (const q of questions) {
            const optionsRes = await this.pool.query(
                'SELECT id, text, is_correct, match_text, order_index FROM exam_options WHERE question_id = $1 ORDER BY order_index ASC',
                [q.id]
            );
            q.options = optionsRes.rows;
        }

        return {
            ...examRes.rows[0],
            questions
        };
    }

    async getAttemptDetail(attemptId: string) {
        const attemptRes = await this.pool.query(
            `SELECT at.*, ea.exam_id 
       FROM exam_attempts at
       JOIN exam_assignments ea ON at.assignment_id = ea.id
       WHERE at.id = $1`,
            [attemptId]
        );

        if (attemptRes.rows.length === 0) return null;
        const examId = attemptRes.rows[0].exam_id;
        return this.getExamDetail(examId);
    }

    async getAssignmentResults(assignmentId: string) {
        const res = await this.pool.query(
            `SELECT at.*, s.first_name, s.last_name, s.email, s.matricula
       FROM exam_attempts at
       JOIN students s ON at.student_id = s.id
       WHERE at.assignment_id = $1
       ORDER BY at.completed_at DESC NULLS LAST`,
            [assignmentId]
        );
        return res.rows;
    }

    // --- Questions & Options ---

    async addQuestion(examId: string, data: { text: string; type: string; points?: number; order_index?: number; image_url?: string; options?: any[] }) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const qRes = await client.query(
                `INSERT INTO exam_questions (exam_id, text, type, points, order_index, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
                [examId, data.text, data.type, data.points || 1, data.order_index || 0, data.image_url]
            );
            const question = qRes.rows[0];

            if (data.options && data.options.length > 0) {
                for (const opt of data.options) {
                    await client.query(
                        `INSERT INTO exam_options (question_id, text, is_correct, match_text, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
                        [question.id, opt.text, opt.is_correct || false, opt.match_text, opt.order_index || 0]
                    );
                }
            }
            await client.query('COMMIT');
            return question;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async updateExam(examId: string, data: { title?: string; description?: string; time_limit_minutes?: number; passing_score?: number }) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (data.title !== undefined) {
            fields.push(`title = $${paramIndex++}`);
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }
        if (data.time_limit_minutes !== undefined) {
            fields.push(`time_limit_minutes = $${paramIndex++}`);
            values.push(data.time_limit_minutes);
        }
        if (data.passing_score !== undefined) {
            fields.push(`passing_score = $${paramIndex++}`);
            values.push(data.passing_score);
        }

        if (fields.length === 0) {
            // No fields to update
            const currentExam = await this.pool.query('SELECT * FROM exams WHERE id = $1', [examId]);
            return currentExam.rows[0];
        }

        fields.push(`updated_at = NOW()`);
        values.push(examId); // examId is the last parameter

        const res = await this.pool.query(
            `UPDATE exams 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
            values
        );
        return res.rows[0];
    }

    async updateQuestion(questionId: string, data: { text?: string; type?: string; points?: number; image_url?: string; options?: any[] }) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const fields = [];
            const values = [];
            let paramIndex = 1;

            if (data.text !== undefined) {
                fields.push(`text = $${paramIndex++}`);
                values.push(data.text);
            }
            if (data.type !== undefined) {
                fields.push(`type = $${paramIndex++}`);
                values.push(data.type);
            }
            if (data.points !== undefined) {
                fields.push(`points = $${paramIndex++}`);
                values.push(data.points);
            }
            if (data.image_url !== undefined) {
                fields.push(`image_url = $${paramIndex++}`);
                values.push(data.image_url);
            }

            let qRes;
            if (fields.length > 0) {
                values.push(questionId); // questionId is the last parameter for the UPDATE clause
                qRes = await client.query(
                    `UPDATE exam_questions 
             SET ${fields.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING *`,
                    values
                );
            } else {
                // If no fields to update, just fetch the current question
                qRes = await client.query('SELECT * FROM exam_questions WHERE id = $1', [questionId]);
            }

            if (data.options) {
                // Simplest: delete and recreate options
                await client.query('DELETE FROM exam_options WHERE question_id = $1', [questionId]);
                for (const opt of data.options) {
                    await client.query(
                        `INSERT INTO exam_options (question_id, text, is_correct, match_text, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
                        [questionId, opt.text, opt.is_correct || false, opt.match_text, opt.order_index || 0]
                    );
                }
            }

            await client.query('COMMIT');
            return qRes.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async deleteQuestion(questionId: string) {
        await this.pool.query('DELETE FROM exam_questions WHERE id = $1', [questionId]);
        return { success: true };
    }

    // --- Assignments ---

    async assignExam(data: { exam_id: string; cohort_id: string; module_id: string; start_date: string; end_date: string }) {
        const res = await this.pool.query(
            `INSERT INTO exam_assignments (exam_id, cohort_id, module_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (exam_id, cohort_id, module_id)
       DO UPDATE SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, is_active = TRUE
       RETURNING *`,
            [data.exam_id, data.cohort_id, data.module_id, data.start_date, data.end_date]
        );
        return res.rows[0];
    }

    async getCohortAssignments(cohortId: string) {
        const res = await this.pool.query(
            `SELECT ea.*, e.title as exam_title, e.time_limit_minutes, am.name as module_name
       FROM exam_assignments ea
       JOIN exams e ON ea.exam_id = e.id
       JOIN academic_modules am ON ea.module_id = am.id
       WHERE ea.cohort_id = $1 AND ea.is_active = TRUE`,
            [cohortId]
        );
        return res.rows;
    }

    // --- Attempts & Grading ---

    async startAttempt(studentId: string, assignmentId: string) {
        // Check if there is an active assignment
        const assignRes = await this.pool.query('SELECT * FROM exam_assignments WHERE id = $1 AND is_active = TRUE', [assignmentId]);
        if (assignRes.rows.length === 0) throw new Error('Assignment not active');

        const res = await this.pool.query(
            `INSERT INTO exam_attempts (assignment_id, student_id, status)
       VALUES ($1, $2, 'IN_PROGRESS')
       RETURNING *`,
            [assignmentId, studentId]
        );
        return res.rows[0];
    }

    async submitAttempt(attemptId: string, answers: { question_id: string; option_id?: string; text_answer?: string }[]) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Record answers
            for (const ans of answers) {
                // Fetch question points and correct options
                const qInfo = await client.query('SELECT * FROM exam_questions WHERE id = $1', [ans.question_id]);
                const question = qInfo.rows[0];

                let isCorrect = false;
                let pointsEarned = 0;

                if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                    const optInfo = await client.query('SELECT * FROM exam_options WHERE id = $1', [ans.option_id]);
                    isCorrect = optInfo.rows[0]?.is_correct || false;
                    pointsEarned = isCorrect ? parseFloat(question.points) : 0;
                } else if (question.type === 'MATCHING') {
                    // For matching, the student provides an option_id and the expected target (text_answer)
                    const optInfo = await client.query('SELECT * FROM exam_options WHERE id = $1', [ans.option_id]);
                    const option = optInfo.rows[0];
                    isCorrect = option?.match_text?.trim().toLowerCase() === ans.text_answer?.trim().toLowerCase();
                    // In matching, we might give partial points, but for now it's all or nothing per option?
                    // Usually matching questions give points per correct pair.
                    // Let's assume points are per pair.
                    pointsEarned = isCorrect ? (parseFloat(question.points) / (await client.query('SELECT COUNT(*) FROM exam_options WHERE question_id = $1', [question.id])).rows[0].count) : 0;
                }

                await client.query(
                    `INSERT INTO exam_answers (attempt_id, question_id, option_id, text_answer, is_correct, points_earned)
           VALUES ($1, $2, $3, $4, $5, $6)`,
                    [attemptId, ans.question_id, ans.option_id, ans.text_answer, isCorrect, pointsEarned]
                );
            }

            // 2. Calculate final score
            const scoreRes = await client.query(
                'SELECT SUM(points_earned) as total_score FROM exam_answers WHERE attempt_id = $1',
                [attemptId]
            );
            const totalScore = parseFloat(scoreRes.rows[0].total_score || 0);

            // 3. Complete attempt
            const attemptRes = await client.query(
                `UPDATE exam_attempts 
         SET completed_at = NOW(), score = $1, status = 'COMPLETED'
         WHERE id = $2
         RETURNING *`,
                [totalScore, attemptId]
            );

            await client.query('COMMIT');
            return attemptRes.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async getStudentAttempts(studentId: string) {
        const res = await this.pool.query(
            `SELECT at.*, e.title as exam_title, am.name as module_name, ea.cohort_id, am.order_index
       FROM exam_attempts at
       JOIN exam_assignments ea ON at.assignment_id = ea.id
       JOIN exams e ON ea.exam_id = e.id
       JOIN academic_modules am ON ea.module_id = am.id
       WHERE at.student_id = $1
       ORDER BY at.completed_at DESC`,
            [studentId]
        );
        return res.rows;
    }
}
