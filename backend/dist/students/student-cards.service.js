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
exports.StudentCardsService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
let StudentCardsService = class StudentCardsService {
    constructor(pool) {
        this.pool = pool;
    }
    async findAll() {
        const res = await this.pool.query(`SELECT sc.*, s.first_name, s.last_name, s.avatar_url
       FROM student_cards sc
       JOIN students s ON sc.student_id = s.id
       ORDER BY sc.created_at DESC`);
        return res.rows;
    }
    async findByStudentId(studentId) {
        const res = await this.pool.query(`SELECT sc.*, s.first_name, s.last_name, s.avatar_url
       FROM student_cards sc
       JOIN students s ON sc.student_id = s.id
       WHERE sc.student_id = $1
       ORDER BY sc.created_at DESC`, [studentId]);
        return res.rows;
    }
    async generateCard(studentId, invoiceId) {
        const studentRes = await this.pool.query('SELECT id, first_name, last_name, matricula FROM students WHERE id = $1', [studentId]);
        if (studentRes.rows.length === 0)
            throw new Error('Student not found');
        const student = studentRes.rows[0];
        const enrollmentRes = await this.pool.query(`SELECT e.id as enrollment_id, p.name as program_name, c.name as cohort_name
       FROM enrollments e
       JOIN academic_cohorts c ON e.cohort_id = c.id
       JOIN academic_programs p ON c.program_id = p.id
       WHERE e.student_id = $1 AND e.status = 'ACTIVE'
       LIMIT 1`, [studentId]);
        if (enrollmentRes.rows.length === 0) {
            const anyEnrollmentRes = await this.pool.query(`SELECT e.id as enrollment_id, p.name as program_name, c.name as cohort_name
           FROM enrollments e
           JOIN academic_cohorts c ON e.cohort_id = c.id
           JOIN academic_programs p ON c.program_id = p.id
           WHERE e.student_id = $1
           ORDER BY e.created_at DESC LIMIT 1`, [studentId]);
            if (anyEnrollmentRes.rows.length === 0)
                throw new Error('Student has no enrollments');
            enrollmentRes.rows[0] = anyEnrollmentRes.rows[0];
        }
        const { enrollment_id, program_name, cohort_name } = enrollmentRes.rows[0];
        const res = await this.pool.query(`INSERT INTO student_cards (
          student_id, invoice_id, enrollment_id, student_name, matricula, program_name, cohort_name
       ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [
            studentId,
            invoiceId || null,
            enrollment_id,
            `${student.first_name} ${student.last_name}`,
            student.matricula,
            program_name,
            cohort_name
        ]);
        return res.rows[0];
    }
    async updateStatus(id, status) {
        const res = await this.pool.query('UPDATE student_cards SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id]);
        return res.rows[0];
    }
};
exports.StudentCardsService = StudentCardsService;
exports.StudentCardsService = StudentCardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], StudentCardsService);
//# sourceMappingURL=student-cards.service.js.map