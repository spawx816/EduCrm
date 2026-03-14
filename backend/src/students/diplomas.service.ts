import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
const PDFDocument = require('pdfkit');
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class DiplomasService {
    constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

    async findAll() {
        const res = await this.pool.query(
            `SELECT 
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
             ORDER BY d.created_at DESC`
        );
        return res.rows;
    }

    async findByStudentId(studentId: string) {
        const res = await this.pool.query(
            'SELECT * FROM diplomas WHERE student_id = $1 ORDER BY created_at DESC',
            [studentId]
        );
        return res.rows;
    }

    async generateDiploma(studentId: string, invoiceId?: string) {
        // 1. Get student and program info
        const studentRes = await this.pool.query(
            `SELECT s.id, s.first_name, s.last_name, p.name as program_name 
             FROM students s
             JOIN enrollments e ON s.id = e.student_id
             JOIN academic_cohorts c ON e.cohort_id = c.id
             JOIN academic_programs p ON c.program_id = p.id
             WHERE s.id = $1
             ORDER BY e.created_at DESC
             LIMIT 1`,
            [studentId]
        );

        if (studentRes.rows.length === 0) {
            // Not in the required program or not found
            return null;
        }

        const student = studentRes.rows[0];
        const studentName = `${student.first_name} ${student.last_name}`.toUpperCase();
        const courseName = student.program_name;

        // 2. Save to database
        const res = await this.pool.query(
            `INSERT INTO diplomas (student_id, invoice_id, student_name, course_name)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [studentId, invoiceId || null, studentName, courseName]
        );

        return res.rows[0];
    }

    async getDiplomaPdf(diplomaId: string): Promise<Buffer> {
        const res = await this.pool.query('SELECT * FROM diplomas WHERE id = $1', [diplomaId]);
        if (res.rows.length === 0) throw new NotFoundException('Diploma not found');
        const diploma = res.rows[0];

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0
            });

            const chunks: Buffer[] = [];
            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err: any) => reject(err));

            const templatePath = join(process.cwd(), 'uploads', 'templates', 'diploma_template.png');

            if (existsSync(templatePath)) {
                // A4 Landscape is 841.89 x 595.28 points
                doc.image(templatePath, 0, 0, { width: 841.89, height: 595.28 });
            }

            // Name: After "A:" - Center it on the first line
            doc.font('Times-Bold').fontSize(36).fillColor('#000000');
            doc.text(diploma.student_name, 60, 285, {
                width: 721.89,
                align: 'center'
            });

            // Course: Under "Por haber completado satisfactoriamente el curso de"
            doc.font('Times-Bold').fontSize(28).fillColor('#000000');
            doc.text(diploma.course_name, 60, 370, {
                width: 721.89,
                align: 'center'
            });

            doc.end();
        });
    }
}
