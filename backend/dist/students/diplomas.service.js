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
exports.DiplomasService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
const PDFDocument = require('pdfkit');
const path_1 = require("path");
const fs_1 = require("fs");
let DiplomasService = class DiplomasService {
    constructor(pool) {
        this.pool = pool;
    }
    async findAll() {
        const res = await this.pool.query(`SELECT 
                d.*, 
                s.matricula, s.first_name, s.last_name,
                lat.id as cohort_id, lat.name as cohort_name,
                lat.prog_name as program_name
             FROM diplomas d
             JOIN students s ON d.student_id = s.id
             LEFT JOIN LATERAL (
                SELECT c.id, c.name, p.name as prog_name
                FROM enrollments e
                JOIN academic_cohorts c ON e.cohort_id = c.id
                JOIN academic_programs p ON c.program_id = p.id
                WHERE e.student_id = s.id
                ORDER BY e.created_at DESC
                LIMIT 1
             ) lat ON true
             ORDER BY d.created_at DESC`);
        return res.rows;
    }
    async findByStudentId(studentId) {
        const res = await this.pool.query('SELECT * FROM diplomas WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
        return res.rows;
    }
    async generateDiploma(studentId, invoiceId) {
        console.log(`Generating diploma for student ${studentId}, invoice ${invoiceId}`);
        if (invoiceId) {
            const existing = await this.pool.query('SELECT id FROM diplomas WHERE invoice_id = $1', [invoiceId]);
            if (existing.rows.length > 0) {
                console.log(`Diploma already exists for invoice ${invoiceId}`);
                return existing.rows[0];
            }
        }
        const studentRes = await this.pool.query(`SELECT s.id, s.first_name, s.last_name, p.name as program_name 
             FROM students s
             JOIN enrollments e ON s.id = e.student_id
             JOIN academic_cohorts c ON e.cohort_id = c.id
             JOIN academic_programs p ON c.program_id = p.id
             WHERE s.id = $1
             ORDER BY e.created_at DESC
             LIMIT 1`, [studentId]);
        if (studentRes.rows.length === 0) {
            console.log(`No active enrollment found for student ${studentId}`);
            return null;
        }
        const student = studentRes.rows[0];
        const studentName = `${student.first_name} ${student.last_name}`.toUpperCase();
        const courseName = student.program_name;
        const res = await this.pool.query(`INSERT INTO diplomas (student_id, invoice_id, student_name, course_name)
             VALUES ($1, $2, $3, $4) RETURNING *`, [studentId, invoiceId || null, studentName, courseName]);
        console.log(`Successfully generated diploma ${res.rows[0].id}`);
        return res.rows[0];
    }
    async getDiplomaPdf(diplomaId) {
        const res = await this.pool.query('SELECT * FROM diplomas WHERE id = $1', [diplomaId]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Diploma not found');
        const diploma = res.rows[0];
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            const templatePath = (0, path_1.join)(process.cwd(), 'uploads', 'templates', 'diploma_template.png');
            if ((0, fs_1.existsSync)(templatePath)) {
                doc.image(templatePath, 0, 0, { width: 841.89, height: 595.28 });
            }
            let nameFontSize = 32;
            doc.font('Times-Bold').fontSize(nameFontSize);
            const maxNameWidth = 450;
            while (doc.widthOfString(diploma.student_name) > maxNameWidth && nameFontSize > 18) {
                nameFontSize -= 1;
                doc.fontSize(nameFontSize);
            }
            doc.fillColor('#000000').text(diploma.student_name, 60, 288, {
                width: 721.89,
                align: 'center'
            });
            doc.font('Times-Bold').fontSize(28).fillColor('#000000');
            doc.text(diploma.course_name, 60, 357, {
                width: 721.89,
                align: 'center'
            });
            doc.end();
        });
    }
};
exports.DiplomasService = DiplomasService;
exports.DiplomasService = DiplomasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], DiplomasService);
//# sourceMappingURL=diplomas.service.js.map