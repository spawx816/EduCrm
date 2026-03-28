import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';

@Injectable()
export class LibraryService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async findAll(studentId?: string) {
    if (studentId) {
      // Find resources assigned to programs the student is enrolled in
      const res = await this.pool.query(
        `SELECT DISTINCT lr.* 
         FROM library_resources lr
         JOIN library_permissions lp ON lr.id = lp.resource_id
         JOIN academic_cohorts ac ON lp.program_id = ac.program_id
         JOIN enrollments e ON ac.id = e.cohort_id
         WHERE e.student_id = $1 AND lr.is_active = true
         ORDER BY lr.created_at DESC`,
        [studentId]
      );
      return res.rows;
    }

    const res = await this.pool.query('SELECT * FROM library_resources ORDER BY created_at DESC');
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM library_resources WHERE id = $1', [id]);
    if (res.rows.length === 0) throw new NotFoundException('Resource not found');
    return res.rows[0];
  }

  async create(data: { title: string; description?: string; resource_type: string; file_url: string; thumbnail_url?: string }) {
    const { title, description, resource_type, file_url, thumbnail_url } = data;
    const res = await this.pool.query(
      'INSERT INTO library_resources (title, description, resource_type, file_url, thumbnail_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, resource_type, file_url, thumbnail_url]
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const { title, description, resource_type, file_url, thumbnail_url, is_active } = data;
    const res = await this.pool.query(
      `UPDATE library_resources 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           resource_type = COALESCE($3, resource_type), 
           file_url = COALESCE($4, file_url), 
           thumbnail_url = COALESCE($5, thumbnail_url),
           is_active = COALESCE($6, is_active),
           updated_at = NOW() 
       WHERE id = $7 RETURNING *`,
      [title, description, resource_type, file_url, thumbnail_url, is_active, id]
    );
    return res.rows[0];
  }

  async delete(id: string) {
    await this.pool.query('DELETE FROM library_resources WHERE id = $1', [id]);
    return { success: true };
  }

  // Permissions
  async getPermissions(resourceId: string) {
    const res = await this.pool.query(
      'SELECT lp.*, p.name as program_name FROM library_permissions lp JOIN academic_programs p ON lp.program_id = p.id WHERE lp.resource_id = $1',
      [resourceId]
    );
    return res.rows;
  }

  async addPermission(resourceId: string, programId: string) {
    const res = await this.pool.query(
      'INSERT INTO library_permissions (resource_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [resourceId, programId]
    );
    return res.rows[0];
  }

  async removePermission(resourceId: string, programId: string) {
    await this.pool.query('DELETE FROM library_permissions WHERE resource_id = $1 AND program_id = $2', [resourceId, programId]);
    return { success: true };
  }
}
