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
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
let ExamsService = class ExamsService {
    constructor(pool) {
        this.pool = pool;
    }
    async getAllExams() {
        const res = await this.pool.query(`SELECT e.*, am.name as module_name 
             FROM exams e
             LEFT JOIN academic_modules am ON e.module_id = am.id
             ORDER BY e.created_at DESC`);
        return res.rows;
    }
    async createExam(data) {
        const res = await this.pool.query(`INSERT INTO exams (module_id, title, description, time_limit_minutes, passing_score, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [data.module_id, data.title, data.description, data.time_limit_minutes || 60, data.passing_score || 60, data.created_by]);
        return res.rows[0];
    }
    async getModuleExams(moduleId) {
        const res = await this.pool.query('SELECT * FROM exams WHERE module_id = $1 ORDER BY created_at DESC', [moduleId]);
        return res.rows;
    }
    async getExamDetail(examId) {
        const examRes = await this.pool.query('SELECT * FROM exams WHERE id = $1', [examId]);
        if (examRes.rows.length === 0)
            return null;
        const questionsRes = await this.pool.query('SELECT * FROM exam_questions WHERE exam_id = $1 ORDER BY order_index ASC', [examId]);
        const questions = questionsRes.rows;
        for (const q of questions) {
            const optionsRes = await this.pool.query('SELECT id, text, is_correct, match_text, order_index FROM exam_options WHERE question_id = $1 ORDER BY order_index ASC', [q.id]);
            q.options = optionsRes.rows;
        }
        return {
            ...examRes.rows[0],
            questions
        };
    }
    async getAttemptDetail(attemptId) {
        const attemptRes = await this.pool.query(`SELECT at.*, ea.exam_id 
       FROM exam_attempts at
       JOIN exam_assignments ea ON at.assignment_id = ea.id
       WHERE at.id = $1`, [attemptId]);
        if (attemptRes.rows.length === 0)
            return null;
        const examId = attemptRes.rows[0].exam_id;
        return this.getExamDetail(examId);
    }
    async getAssignmentResults(assignmentId) {
        const res = await this.pool.query(`SELECT at.*, s.first_name, s.last_name, s.email, s.matricula
       FROM exam_attempts at
       JOIN students s ON at.student_id = s.id
       WHERE at.assignment_id = $1
       ORDER BY at.completed_at DESC NULLS LAST`, [assignmentId]);
        return res.rows;
    }
    async addQuestion(examId, data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const qRes = await client.query(`INSERT INTO exam_questions (exam_id, text, type, points, order_index, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`, [examId, data.text, data.type, data.points || 1, data.order_index || 0, data.image_url]);
            const question = qRes.rows[0];
            if (data.options && data.options.length > 0) {
                for (const opt of data.options) {
                    await client.query(`INSERT INTO exam_options (question_id, text, is_correct, match_text, order_index)
             VALUES ($1, $2, $3, $4, $5)`, [question.id, opt.text, opt.is_correct || false, opt.match_text, opt.order_index || 0]);
                }
            }
            await client.query('COMMIT');
            return question;
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async updateExam(examId, data) {
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
            const currentExam = await this.pool.query('SELECT * FROM exams WHERE id = $1', [examId]);
            return currentExam.rows[0];
        }
        fields.push(`updated_at = NOW()`);
        values.push(examId);
        const res = await this.pool.query(`UPDATE exams 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`, values);
        return res.rows[0];
    }
    async updateQuestion(questionId, data) {
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
                values.push(questionId);
                qRes = await client.query(`UPDATE exam_questions 
             SET ${fields.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING *`, values);
            }
            else {
                qRes = await client.query('SELECT * FROM exam_questions WHERE id = $1', [questionId]);
            }
            if (data.options) {
                await client.query('DELETE FROM exam_options WHERE question_id = $1', [questionId]);
                for (const opt of data.options) {
                    await client.query(`INSERT INTO exam_options (question_id, text, is_correct, match_text, order_index)
             VALUES ($1, $2, $3, $4, $5)`, [questionId, opt.text, opt.is_correct || false, opt.match_text, opt.order_index || 0]);
                }
            }
            await client.query('COMMIT');
            return qRes.rows[0];
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async deleteExam(examId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`
                DELETE FROM exam_answers 
                WHERE attempt_id IN (
                    SELECT id FROM exam_attempts WHERE assignment_id IN (
                        SELECT id FROM exam_assignments WHERE exam_id = $1
                    )
                )
            `, [examId]);
            await client.query(`
                DELETE FROM exam_attempts 
                WHERE assignment_id IN (
                    SELECT id FROM exam_assignments WHERE exam_id = $1
                )
            `, [examId]);
            await client.query('DELETE FROM exam_assignments WHERE exam_id = $1', [examId]);
            await client.query(`
                DELETE FROM exam_options 
                WHERE question_id IN (
                    SELECT id FROM exam_questions WHERE exam_id = $1
                )
            `, [examId]);
            await client.query('DELETE FROM exam_questions WHERE exam_id = $1', [examId]);
            await client.query('DELETE FROM exams WHERE id = $1', [examId]);
            await client.query('COMMIT');
            return { success: true };
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async deleteQuestion(questionId) {
        await this.pool.query('DELETE FROM exam_questions WHERE id = $1', [questionId]);
        return { success: true };
    }
    async assignExam(data) {
        const res = await this.pool.query(`INSERT INTO exam_assignments (exam_id, cohort_id, module_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (exam_id, cohort_id, module_id)
       DO UPDATE SET is_active = TRUE
       RETURNING *`, [data.exam_id, data.cohort_id, data.module_id, data.start_date || null, data.end_date || null]);
        return res.rows[0];
    }
    async updateAssignmentSchedule(id, start_date, end_date) {
        const res = await this.pool.query(`UPDATE exam_assignments 
       SET start_date = $1, end_date = $2, is_active = TRUE
       WHERE id = $3
       RETURNING *`, [start_date, end_date, id]);
        return res.rows[0];
    }
    async getAllAssignments() {
        const res = await this.pool.query(`SELECT ea.*, e.title as exam_title, c.name as cohort_name, am.name as module_name, p.name as program_name
             FROM exam_assignments ea
             JOIN exams e ON ea.exam_id = e.id
             JOIN cohorts c ON ea.cohort_id = c.id
             JOIN academic_modules am ON ea.module_id = am.id
             JOIN academic_programs p ON c.program_id = p.id
             WHERE ea.is_active = TRUE
             ORDER BY ea.created_at DESC`);
        return res.rows;
    }
    async getCohortAssignments(cohortId) {
        const res = await this.pool.query(`SELECT ea.*, e.title as exam_title, e.time_limit_minutes, am.name as module_name
       FROM exam_assignments ea
       JOIN exams e ON ea.exam_id = e.id
       JOIN academic_modules am ON ea.module_id = am.id
       WHERE ea.cohort_id = $1 AND ea.is_active = TRUE`, [cohortId]);
        return res.rows;
    }
    async startAttempt(studentId, assignmentId) {
        const assignRes = await this.pool.query('SELECT * FROM exam_assignments WHERE id = $1 AND is_active = TRUE', [assignmentId]);
        if (assignRes.rows.length === 0)
            throw new Error('Assignment not active');
        const res = await this.pool.query(`INSERT INTO exam_attempts (assignment_id, student_id, status)
       VALUES ($1, $2, 'IN_PROGRESS')
       RETURNING *`, [assignmentId, studentId]);
        return res.rows[0];
    }
    async submitAttempt(attemptId, answers) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            for (const ans of answers) {
                const qInfo = await client.query('SELECT * FROM exam_questions WHERE id = $1', [ans.question_id]);
                const question = qInfo.rows[0];
                let isCorrect = false;
                let pointsEarned = 0;
                if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                    const optInfo = await client.query('SELECT * FROM exam_options WHERE id = $1', [ans.option_id]);
                    isCorrect = optInfo.rows[0]?.is_correct || false;
                    pointsEarned = isCorrect ? parseFloat(question.points) : 0;
                }
                else if (question.type === 'MATCHING') {
                    const optInfo = await client.query('SELECT * FROM exam_options WHERE id = $1', [ans.option_id]);
                    const option = optInfo.rows[0];
                    isCorrect = option?.match_text?.trim().toLowerCase() === ans.text_answer?.trim().toLowerCase();
                    pointsEarned = isCorrect ? (parseFloat(question.points) / (await client.query('SELECT COUNT(*) FROM exam_options WHERE question_id = $1', [question.id])).rows[0].count) : 0;
                }
                await client.query(`INSERT INTO exam_answers (attempt_id, question_id, option_id, text_answer, is_correct, points_earned)
           VALUES ($1, $2, $3, $4, $5, $6)`, [attemptId, ans.question_id, ans.option_id, ans.text_answer, isCorrect, pointsEarned]);
            }
            const scoreRes = await client.query('SELECT SUM(points_earned) as total_score FROM exam_answers WHERE attempt_id = $1', [attemptId]);
            const totalScore = parseFloat(scoreRes.rows[0].total_score || 0);
            const attemptRes = await client.query(`UPDATE exam_attempts 
         SET completed_at = NOW(), score = $1, status = 'COMPLETED'
         WHERE id = $2
         RETURNING *`, [totalScore, attemptId]);
            const assignRes = await client.query(`SELECT ea.cohort_id, ea.module_id, at.student_id 
                 FROM exam_assignments ea 
                 JOIN exam_attempts at ON at.assignment_id = ea.id 
                 WHERE at.id = $1`, [attemptId]);
            if (assignRes.rows.length > 0) {
                const { cohort_id, module_id, student_id } = assignRes.rows[0];
                const gtRes = await client.query(`SELECT id, weight FROM grade_types 
                     WHERE (module_id = $1 OR (module_id IS NULL AND program_id = (SELECT program_id FROM academic_modules WHERE id = $1)))
                     AND name ILIKE '%Examen%'
                     LIMIT 1`, [module_id]);
                if (gtRes.rows.length > 0) {
                    const gradeTypeId = gtRes.rows[0].id;
                    const weight = parseFloat(gtRes.rows[0].weight) || 0;
                    let finalValue = totalScore;
                    if (weight > 1 && totalScore > weight) {
                        finalValue = (totalScore / 100) * weight;
                    }
                    await client.query(`INSERT INTO grades (student_id, cohort_id, module_id, grade_type_id, value)
                         VALUES ($1, $2, $3, $4, $5)
                         ON CONFLICT (student_id, cohort_id, module_id, grade_type_id)
                         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`, [student_id, cohort_id, module_id, gradeTypeId, finalValue]);
                }
            }
            await client.query('COMMIT');
            return attemptRes.rows[0];
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getStudentAttempts(studentId) {
        const res = await this.pool.query(`SELECT at.*, e.title as exam_title, am.name as module_name, ea.cohort_id, am.order_index
       FROM exam_attempts at
       JOIN exam_assignments ea ON at.assignment_id = ea.id
       JOIN exams e ON ea.exam_id = e.id
       JOIN academic_modules am ON ea.module_id = am.id
       WHERE at.student_id = $1
       ORDER BY at.completed_at DESC`, [studentId]);
        return res.rows;
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], ExamsService);
//# sourceMappingURL=exams.service.js.map