import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';
import { StorageService } from '../common/storage.service';
import { MailService } from '../common/mail.service';
import { IRedMailService } from '../integrations/iredmail.service';

@Injectable()
export class StudentsService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
    private readonly iredMailService: IRedMailService,
  ) { }

  async findAll(filters?: { search?: string; status?: string; sede_id?: string }) {
    let query = 'SELECT * FROM students WHERE deleted_at IS NULL';
    const params: any[] = [];

    if (filters?.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }

    if (filters?.sede_id) {
      params.push(filters.sede_id);
      query += ` AND sede_id = $${params.length}`;
    }

    if (filters?.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length} OR matricula ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query(
      `SELECT s.*, 
       (SELECT json_agg(row_to_json(e_data)) FROM (
          SELECT e.*, c.name as cohort_name, p.name as program_name,
                 s_tab.name as scholarship_name, s_tab.type as scholarship_type, s_tab.value as scholarship_value
          FROM enrollments e
          JOIN academic_cohorts c ON e.cohort_id = c.id
          JOIN academic_programs p ON c.program_id = p.id
          LEFT JOIN scholarships s_tab ON e.scholarship_id = s_tab.id
          WHERE e.student_id = s.id
       ) e_data) as enrollments
       FROM students s WHERE s.id = $1`,
      [id]
    );
    if (res.rows.length === 0) {
      throw new NotFoundException('Student not found');
    }
    return res.rows[0];
  }

  async convertLead(leadId: string) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get lead details
      const leadRes = await client.query('SELECT * FROM leads WHERE id = $1', [leadId]);
      if (leadRes.rows.length === 0) throw new NotFoundException('Lead not found');
      const lead = leadRes.rows[0];

      // Create student with matricula
      const matriculaRes = await client.query("SELECT nextval('student_matricula_seq')");
      const nextVal = matriculaRes.rows[0].nextval;
      const formattedMatricula = String(nextVal).padStart(6, '0');

      const studentRes = await client.query(
        `INSERT INTO students (first_name, last_name, email, phone, sede_id, lead_id, matricula, document_type, document_id, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          lead.first_name,
          lead.last_name,
          lead.email,
          lead.phone,
          lead.sede_id,
          lead.id,
          formattedMatricula,
          lead.document_type || 'CEDULA',
          lead.document_id,
          lead.address
        ]
      );
      const student = studentRes.rows[0];

      // iRedMail Integration
      try {
        const tempPassword = Math.random().toString(36).slice(-8);
        await this.iredMailService.createAccount(student.email, tempPassword, `${student.first_name} ${student.last_name}`);
        await this.mailService.sendWelcomeEmail(student.email, student.first_name, { email: student.email, password: tempPassword });
      } catch (mailError) {
        console.error('Failed to create iRedMail account or send email:', mailError);
        // We don't rollback here because the student was successfully created in CRM
      }

      await client.query('COMMIT');
      return student;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async create(data: {
    first_name: string;
    last_name: string;
    email: string;
    document_type: string;
    document_id: string; // Cedula / Pasaporte
    phone?: string;
    address?: string;
  }) {
    const matriculaRes = await this.pool.query("SELECT nextval('student_matricula_seq')");
    const nextVal = matriculaRes.rows[0].nextval;
    const formattedMatricula = String(nextVal).padStart(6, '0');

    try {
      const studentRes = await this.pool.query(
        `INSERT INTO students (first_name, last_name, email, document_type, document_id, phone, matricula)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [data.first_name, data.last_name, data.email, data.document_type || 'CEDULA', data.document_id, data.phone || null, formattedMatricula]
      );
      const student = studentRes.rows[0];

      // iRedMail Integration
      try {
        const tempPassword = Math.random().toString(36).slice(-8);
        await this.iredMailService.createAccount(student.email, tempPassword, `${student.first_name} ${student.last_name}`);
        await this.mailService.sendWelcomeEmail(student.email, student.first_name, { email: student.email, password: tempPassword });
      } catch (mailError) {
        console.error('Failed to create iRedMail account or send email:', mailError);
      }

      return student;
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'students_document_id_key') {
        throw new BadRequestException('Ya existe un estudiante con ese número de Cédula o Pasaporte.');
      }
      if (error.code === '23505' && error.constraint === 'students_email_key') {
        throw new BadRequestException('Ya existe un estudiante con ese correo electrónico.');
      }
      throw error;
    }
  }

  async update(id: string, data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    document_type?: string;
    document_id?: string;
    phone?: string;
    address?: string;
    status?: string;
    sede_id?: string;
    is_active?: boolean;
  }) {
    try {
      const res = await this.pool.query(
        `UPDATE students 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             email = COALESCE($3, email),
             document_type = COALESCE($4, document_type),
             document_id = COALESCE($5, document_id),
             phone = COALESCE($6, phone),
             address = COALESCE($7, address),
             status = COALESCE($8, status),
             sede_id = COALESCE($9, sede_id),
             is_active = COALESCE($10, is_active),
             updated_at = NOW()
         WHERE id = $11 AND deleted_at IS NULL
         RETURNING *`,
        [
          data.first_name,
          data.last_name,
          data.email,
          data.document_type,
          data.document_id,
          data.phone,
          data.address,
          data.status,
          data.sede_id || null,
          data.is_active,
          id
        ]
      );

      if (res.rows.length === 0) {
        throw new NotFoundException('Student not found');
      }

      return res.rows[0];
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'students_document_id_key') {
        throw new BadRequestException('Ya existe un estudiante con ese número de Cédula o Pasaporte.');
      }
      if (error.code === '23505' && error.constraint === 'students_email_key') {
        throw new BadRequestException('Ya existe un estudiante con ese correo electrónico.');
      }
      throw error;
    }
  }

  async enroll(data: { studentId: string; cohortId: string; scholarshipId?: string; status?: string }) {
    const { studentId, cohortId, scholarshipId, status = 'ACTIVE' } = data;

    // 1. Get the program_id of the new cohort
    const cohortRes = await this.pool.query('SELECT program_id FROM academic_cohorts WHERE id = $1', [cohortId]);
    if (cohortRes.rows.length === 0) throw new NotFoundException('Cohort not found');
    const programId = cohortRes.rows[0].program_id;

    // 2. Check if student is already enrolled in any cohort of this program
    const existingRes = await this.pool.query(
      `SELECT e.id 
       FROM enrollments e
       JOIN academic_cohorts c ON e.cohort_id = c.id
       WHERE e.student_id = $1 AND c.program_id = $2 AND e.status = 'ACTIVE'`,
      [studentId, programId]
    );

    if (existingRes.rows.length > 0) {
      throw new BadRequestException('El estudiante ya se encuentra inscrito en este programa académico.');
    }

    const res = await this.pool.query(
      'INSERT INTO enrollments (student_id, cohort_id, scholarship_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentId, cohortId, scholarshipId || null, status]
    );
    return res.rows[0];
  }

  // PORTAL METHODS
  async loginPortal(matricula: string, email: string) {
    const res = await this.pool.query(
      'SELECT id, matricula, first_name, last_name, email FROM students WHERE matricula = $1 AND email = $2 AND deleted_at IS NULL AND is_active = TRUE',
      [matricula, email]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  async getPortalInvoices(studentId: string) {
    const res = await this.pool.query(
      `SELECT i.*, 
       COALESCE((SELECT json_agg(row_to_json(items_data)) FROM (
          SELECT id.*, COALESCE(bi.name, id.description) as item_name
          FROM invoice_details id
          LEFT JOIN billing_items bi ON id.item_id = bi.id
          WHERE id.invoice_id = i.id
       ) items_data), '[]'::json) as items
       FROM invoices i 
       WHERE i.student_id = $1 
       ORDER BY i.created_at DESC`,
      [studentId]
    );
    return res.rows;
  }

  async getPortalAcademic(studentId: string) {
    const res = await this.pool.query(
      `SELECT e.*, c.name as cohort_name, p.name as program_name, p.code as program_code
       FROM enrollments e
       JOIN academic_cohorts c ON e.cohort_id = c.id
       JOIN academic_programs p ON c.program_id = p.id
       WHERE e.student_id = $1`,
      [studentId]
    );
    return res.rows;
  }

  async getPortalAttendance(studentId: string) {
    const res = await this.pool.query(
      `SELECT a.*, c.name as cohort_name, m.name as module_name,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM attendance a
       JOIN academic_cohorts c ON a.cohort_id = c.id
       LEFT JOIN academic_modules m ON a.module_id = m.id
       LEFT JOIN academic_cohort_modules cm ON a.cohort_id = cm.cohort_id AND a.module_id = cm.module_id
       LEFT JOIN users u ON cm.teacher_id = u.id
       WHERE a.student_id = $1 
       ORDER BY a.date DESC`,
      [studentId]
    );
    return res.rows;
  }

  async getPortalGrades(studentId: string) {
    const res = await this.pool.query(
      `SELECT g.*, gt.name as grade_type_name, c.name as cohort_name, m.name as module_name,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM grades g
       JOIN grade_types gt ON g.grade_type_id = gt.id
       JOIN academic_cohorts c ON g.cohort_id = c.id
       LEFT JOIN academic_modules m ON g.module_id = m.id
       LEFT JOIN academic_cohort_modules cm ON g.cohort_id = cm.cohort_id AND g.module_id = cm.module_id
       LEFT JOIN users u ON cm.teacher_id = u.id
       WHERE g.student_id = $1 
       ORDER BY m.order_index ASC, m.name ASC, g.created_at DESC`,
      [studentId]
    );
    return res.rows;
  }

  async getFullHistory(studentId: string) {
    const res = await this.pool.query(
      `SELECT e.*, c.name as cohort_name, p.name as program_name,
       (
           SELECT json_agg(row_to_json(m_data)) FROM (
               SELECT am.*, 
               (SELECT json_agg(row_to_json(g_data)) FROM (
                   SELECT g.*, gt.name as grade_type_name
                   FROM grades g
                   JOIN grade_types gt ON g.grade_type_id = gt.id
                   WHERE g.student_id = $1 AND g.module_id = am.id AND g.cohort_id = e.cohort_id
               ) g_data) as grades,
               (SELECT json_agg(row_to_json(a_data)) FROM (
                   SELECT a.*
                   FROM attendance a
                   WHERE a.student_id = $1 AND a.module_id = am.id AND a.cohort_id = e.cohort_id
               ) a_data) as attendance,
               (SELECT json_agg(row_to_json(ex_data)) FROM (
                   SELECT ea.id as assignment_id, ex.title as exam_title, eat.score, eat.status as attempt_status, eat.completed_at
                   FROM exam_assignments ea
                   JOIN exams ex ON ea.exam_id = ex.id
                   LEFT JOIN exam_attempts eat ON ea.id = eat.assignment_id AND eat.student_id = $1
                   WHERE ea.module_id = am.id AND ea.cohort_id = e.cohort_id
               ) ex_data) as exams
               FROM academic_modules am
               WHERE am.program_id = c.program_id
               ORDER BY am.order_index ASC, am.name ASC
           ) m_data
       ) as modules
       FROM enrollments e
       JOIN academic_cohorts c ON e.cohort_id = c.id
       JOIN academic_programs p ON c.program_id = p.id
       WHERE e.student_id = $1`,
      [studentId]
    );
    return res.rows;
  }

  async getAttachments(studentId: string) {
    const res = await this.pool.query(
      'SELECT * FROM student_attachments WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    return res.rows;
  }

  async uploadAttachment(studentId: string, file: any) {
    const { filename } = await this.storageService.saveFile(file, 'students');
    const res = await this.pool.query(
      `INSERT INTO student_attachments (student_id, filename, original_name, mimetype, size)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [studentId, filename, file.originalname, file.mimetype, file.size]
    );
    return res.rows[0];
  }

  async deleteAttachment(id: string) {
    const attachmentRes = await this.pool.query('SELECT filename FROM student_attachments WHERE id = $1', [id]);
    if (attachmentRes.rows.length === 0) throw new NotFoundException('Attachment not found');

    await this.storageService.deleteFile(attachmentRes.rows[0].filename, 'students');

    const res = await this.pool.query(
      'DELETE FROM student_attachments WHERE id = $1 RETURNING *',
      [id]
    );
    return res.rows[0];
  }

  async uploadAvatar(studentId: string, file: any) {
    // 1. Obtener información actual del estudiante para ver si ya tiene un avatar
    const studentRes = await this.pool.query('SELECT avatar_url FROM students WHERE id = $1', [studentId]);
    if (studentRes.rows.length === 0) throw new NotFoundException('Student not found');
    const oldAvatarUrl = studentRes.rows[0].avatar_url;

    // 2. Guardar el nuevo archivo
    const { filename } = await this.storageService.saveFile(file, 'students/avatars');

    // 3. Eliminar el archivo anterior si existía
    if (oldAvatarUrl) {
      try {
        await this.storageService.deleteFile(oldAvatarUrl, 'students/avatars');
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
      }
    }

    // 4. Actualizar la base de datos
    const updateRes = await this.pool.query(
      'UPDATE students SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [filename, studentId]
    );

    return updateRes.rows[0];
  }

  async deleteEnrollment(id: string) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Check if enrollment exists
      const enrollmentRes = await client.query('SELECT * FROM enrollments WHERE id = $1', [id]);
      if (enrollmentRes.rows.length === 0) throw new NotFoundException('Enrollment not found');

      // Delete related records (grades, attendance, exam attempts)
      await client.query('DELETE FROM grades WHERE cohort_id = $1 AND student_id = $2', [enrollmentRes.rows[0].cohort_id, enrollmentRes.rows[0].student_id]);
      await client.query('DELETE FROM attendance WHERE cohort_id = $1 AND student_id = $2', [enrollmentRes.rows[0].cohort_id, enrollmentRes.rows[0].student_id]);

      // Delete exam attempts related to this cohort+student indirectly
      await client.query(`
        DELETE FROM exam_attempts 
        WHERE student_id = $1 AND assignment_id IN (
            SELECT id FROM exam_assignments WHERE cohort_id = $2
        )
      `, [enrollmentRes.rows[0].student_id, enrollmentRes.rows[0].cohort_id]);

      // Finally delete the enrollment
      const res = await client.query('DELETE FROM enrollments WHERE id = $1 RETURNING *', [id]);

      await client.query('COMMIT');
      return res.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
