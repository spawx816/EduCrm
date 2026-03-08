import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';

@Injectable()
export class AcademicService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  // Sedes
  async findAllSedes() {
    const res = await this.pool.query('SELECT * FROM sedes WHERE is_active = true ORDER BY name ASC');
    return res.rows;
  }

  // Programs
  async findAllPrograms() {
    const res = await this.pool.query('SELECT * FROM academic_programs WHERE deleted_at IS NULL ORDER BY name ASC');
    return res.rows;
  }

  async findProgramById(id: string) {
    const res = await this.pool.query('SELECT * FROM academic_programs WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) throw new NotFoundException('Program not found');
    return res.rows[0];
  }

  async createProgram(data: { name: string; description?: string; code?: string; enrollment_price?: number; billing_day?: number }) {
    const { name, description, code, enrollment_price = 0, billing_day = 5 } = data;
    const res = await this.pool.query(
      'INSERT INTO academic_programs (name, description, code, enrollment_price, billing_day) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, code, enrollment_price, billing_day]
    );
    return res.rows[0];
  }

  async updateProgram(id: string, data: { name?: string; description?: string; code?: string; is_active?: boolean; enrollment_price?: number; billing_day?: number }) {
    const { name, description, code, is_active, enrollment_price, billing_day } = data;
    const res = await this.pool.query(
      `UPDATE academic_programs 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           code = COALESCE($3, code), 
           is_active = COALESCE($4, is_active),
           enrollment_price = COALESCE($5, enrollment_price),
           billing_day = COALESCE($6, billing_day),
           updated_at = NOW() 
       WHERE id = $7 AND deleted_at IS NULL 
       RETURNING *`,
      [name, description, code, is_active, enrollment_price, billing_day, id]
    );
    if (res.rows.length === 0) throw new NotFoundException('Program not found');
    return res.rows[0];
  }

  async deleteProgram(id: string) {
    const res = await this.pool.query(
      'UPDATE academic_programs SET deleted_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );
    if (res.rows.length === 0) throw new NotFoundException('Program not found');
    return res.rows[0];
  }

  // Cohorts (Cohortes/Grupos)
  async findAllCohorts(programId?: string) {
    let query = 'SELECT c.*, p.name as program_name FROM academic_cohorts c JOIN academic_programs p ON c.program_id = p.id WHERE c.deleted_at IS NULL';
    const params = [];
    if (programId) {
      params.push(programId);
      query += ` AND c.program_id = $${params.length}`;
    }
    query += ' ORDER BY c.start_date DESC';
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  async createCohort(data: { program_id: string; name: string; start_date: Date | string; end_date?: Date | string; requires_enrollment?: boolean }) {
    const { program_id, name } = data;
    const start_date = data.start_date || null;
    const end_date = data.end_date || null;

    const res = await this.pool.query(
      'INSERT INTO academic_cohorts (program_id, name, start_date, end_date, requires_enrollment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [program_id, name, start_date, end_date, data.requires_enrollment ?? true]
    );
    return res.rows[0];
  }

  async updateCohort(id: string, data: { name?: string; start_date?: Date | string; end_date?: Date | string; is_active?: boolean; requires_enrollment?: boolean }) {
    const { name, is_active } = data;
    const start_date = data.start_date === '' ? null : (data.start_date || undefined);
    const end_date = data.end_date === '' ? null : (data.end_date || undefined);

    const res = await this.pool.query(
      `UPDATE academic_cohorts 
       SET name = COALESCE($1, name), 
           start_date = COALESCE($2, start_date), 
           end_date = COALESCE($3, end_date), 
           is_active = COALESCE($4, is_active),
           requires_enrollment = COALESCE($5, requires_enrollment),
           updated_at = NOW() 
       WHERE id = $6 AND deleted_at IS NULL 
       RETURNING *`,
      [name, start_date, end_date, is_active, data.requires_enrollment, id]
    );
    if (res.rows.length === 0) throw new NotFoundException('Cohort not found');
    return res.rows[0];
  }

  async deleteCohort(id: string) {
    const res = await this.pool.query(
      'UPDATE academic_cohorts SET deleted_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );
    if (res.rows.length === 0) throw new NotFoundException('Cohort not found');
    return res.rows[0];
  }

  // Attendance
  // Modules
  async findModulesByProgram(programId: string) {
    const res = await this.pool.query(
      'SELECT * FROM academic_modules WHERE program_id = $1 AND deleted_at IS NULL ORDER BY order_index ASC',
      [programId]
    );
    return res.rows;
  }

  async createModule(data: { program_id: string; name: string; description?: string; order_index?: number; price?: number }) {
    const { program_id, name, description, order_index = 0, price = 0 } = data;
    const res = await this.pool.query(
      'INSERT INTO academic_modules (program_id, name, description, order_index, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [program_id, name, description, order_index, price]
    );
    return res.rows[0];
  }

  async updateModule(id: string, data: { name?: string; description?: string; order_index?: number; price?: number }) {
    const { name, description, order_index, price } = data;
    const res = await this.pool.query(
      `UPDATE academic_modules 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           order_index = COALESCE($3, order_index), 
           price = COALESCE($4, price),
           updated_at = NOW() 
       WHERE id = $5 AND deleted_at IS NULL 
       RETURNING *`,
      [name, description, order_index, price, id]
    );
    if (res.rows.length === 0) throw new NotFoundException('Module not found');
    return res.rows[0];
  }

  async deleteModule(id: string) {
    const res = await this.pool.query(
      'UPDATE academic_modules SET deleted_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );
    if (res.rows.length === 0) throw new NotFoundException('Module not found');
    return res.rows[0];
  }

  // Module Addons
  async addModuleAddon(moduleId: string, itemId: string) {
    const res = await this.pool.query(
      'INSERT INTO academic_module_addons (module_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [moduleId, itemId]
    );
    return res.rows[0];
  }

  async removeModuleAddon(moduleId: string, itemId: string) {
    await this.pool.query(
      'DELETE FROM academic_module_addons WHERE module_id = $1 AND item_id = $2',
      [moduleId, itemId]
    );
    return { success: true };
  }

  async getModuleAddons(moduleId: string) {
    const res = await this.pool.query(
      `SELECT bi.* 
       FROM academic_module_addons ama
       JOIN billing_items bi ON ama.item_id = bi.id
       WHERE ama.module_id = $1`,
      [moduleId]
    );
    return res.rows;
  }

  // Cohort Modules & Instructor Assignment
  async assignInstructorToModule(data: { cohort_id: string; module_id: string; teacher_id: string; start_date?: Date | string; end_date?: Date | string }) {
    const { cohort_id, module_id, teacher_id } = data;
    const start_date = data.start_date || null;
    const end_date = data.end_date || null;

    const res = await this.pool.query(
      `INSERT INTO academic_cohort_modules (cohort_id, module_id, teacher_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (cohort_id, module_id)
       DO UPDATE SET teacher_id = EXCLUDED.teacher_id, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, updated_at = NOW()
       RETURNING *`,
      [cohort_id, module_id, teacher_id, start_date, end_date]
    );
    return res.rows[0];
  }

  async getCohortModules(cohortId: string) {
    const res = await this.pool.query(
      `SELECT cm.*, m.name as module_name, u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM academic_cohort_modules cm
       JOIN academic_modules m ON cm.module_id = m.id
       LEFT JOIN users u ON cm.teacher_id = u.id
       WHERE cm.cohort_id = $1`,
      [cohortId]
    );
    return res.rows;
  }

  // Attendance (Updated for Modules)
  async registerAttendance(data: { cohort_id: string; module_id: string; date: string; records: { student_id: string; status: string; remarks?: string }[] }) {
    const { cohort_id, module_id, date, records } = data;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const record of records) {
        await client.query(
          `INSERT INTO attendance (student_id, cohort_id, module_id, date, status, remarks)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (student_id, cohort_id, date, module_id) 
           DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, updated_at = NOW()`,
          [record.student_id, cohort_id, module_id, date, record.status, record.remarks]
        );
      }
      await client.query('COMMIT');
      return { success: true, count: records.length };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getCohortAttendance(cohortId: string, module_id?: string, date?: string) {
    let query = 'SELECT a.*, s.first_name, s.last_name FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.cohort_id = $1';
    const params: any[] = [cohortId];

    if (module_id) {
      params.push(module_id);
      query += ` AND a.module_id = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND a.date = $${params.length}`;
    }
    query += ' ORDER BY a.date DESC, s.last_name ASC';
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  // Grades (Updated for Modules)
  async findGradeTypes(programId: string, module_id?: string) {
    let query = 'SELECT * FROM grade_types WHERE program_id = $1';
    const params: any[] = [programId];
    if (module_id) {
      params.push(module_id);
      query += ` AND module_id = $${params.length}`;
    }
    query += ' ORDER BY created_at ASC';
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  async createGradeType(data: { program_id: string; module_id?: string; name: string; weight?: number }) {
    const { program_id, module_id, name, weight = 1.0 } = data;
    const res = await this.pool.query(
      'INSERT INTO grade_types (program_id, module_id, name, weight) VALUES ($1, $2, $3, $4) RETURNING *',
      [program_id, module_id, name, weight]
    );
    return res.rows[0];
  }

  async registerGrades(data: { cohort_id: string; module_id: string; grade_type_id: string; records: { student_id: string; value: number; remarks?: string }[] }) {
    const { cohort_id, module_id, grade_type_id, records } = data;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const record of records) {
        await client.query(
          `INSERT INTO grades (student_id, cohort_id, module_id, grade_type_id, value, remarks)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (student_id, cohort_id, module_id, grade_type_id)
           DO UPDATE SET value = EXCLUDED.value, remarks = EXCLUDED.remarks, updated_at = NOW()
           RETURNING *`,
          [record.student_id, cohort_id, module_id, grade_type_id, record.value, record.remarks]
        );
      }
      await client.query('COMMIT');
      return { success: true, count: records.length };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getCohortGrades(cohortId: string, module_id?: string) {
    let query = `
       SELECT g.*, s.first_name, s.last_name, gt.name as grade_type_name
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN grade_types gt ON g.grade_type_id = gt.id
       WHERE g.cohort_id = $1`;
    const params: any[] = [cohortId];

    if (module_id) {
      params.push(module_id);
      query += ` AND g.module_id = $${params.length}`;
    }

    query += ' ORDER BY gt.created_at ASC, s.last_name ASC';
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  async findInstructors() {
    const res = await this.pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE r.name = 'docente' AND u.deleted_at IS NULL`
    );
    return res.rows;
  }

  async getInstructorCohorts(teacherId: string) {
    const res = await this.pool.query(
      `SELECT DISTINCT c.*, p.name as program_name
       FROM academic_cohorts c
       JOIN academic_programs p ON c.program_id = p.id
       JOIN academic_cohort_modules cm ON c.id = cm.cohort_id
       WHERE cm.teacher_id = $1 AND c.deleted_at IS NULL`,
      [teacherId]
    );
    return res.rows;
  }

  async getInstructorModules(teacherId: string, cohortId: string) {
    const res = await this.pool.query(
      `SELECT cm.*, m.name as module_name, m.description as module_description
       FROM academic_cohort_modules cm
       JOIN academic_modules m ON cm.module_id = m.id
       WHERE cm.teacher_id = $1 AND cm.cohort_id = $2`,
      [teacherId, cohortId]
    );
    return res.rows;
  }

  async getCohortStudents(cohortId: string) {
    const res = await this.pool.query(
      `SELECT s.*, e.enrollment_date, e.status as enrollment_status
       FROM students s
       JOIN enrollments e ON s.id = e.student_id
       WHERE e.cohort_id = $1 AND s.deleted_at IS NULL
       ORDER BY s.last_name ASC, s.first_name ASC`,
      [cohortId]
    );
    return res.rows;
  }
}
