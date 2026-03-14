import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class CalendarService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async findAll(role?: string) {
    let query = 'SELECT * FROM calendar_events WHERE 1=1';
    const params = [];

    // Simple role-based visibility filtering
    if (role === 'student' || role === 'docente') {
      query += " AND (visibility = 'ALL' OR visibility = $1)";
      params.push(role === 'student' ? 'ALL' : 'TEACHERS'); 
    }

    query += ' ORDER BY event_date ASC';
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  async create(data: any, userId: string) {
    const { title, description, event_date, end_date, type, visibility } = data;
    const res = await this.pool.query(
      `INSERT INTO calendar_events (title, description, event_date, end_date, type, visibility, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, event_date, end_date, type || 'EVENT', visibility || 'ALL', userId]
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['title', 'description', 'event_date', 'end_date', 'type', 'visibility'].includes(key)) {
        fields.push(`${key} = $${i++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE calendar_events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`;
    const res = await this.pool.query(query, values);
    
    if (res.rows.length === 0) throw new NotFoundException('Event not found');
    return res.rows[0];
  }

  async remove(id: string) {
    const res = await this.pool.query('DELETE FROM calendar_events WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) throw new NotFoundException('Event not found');
    return res.rows[0];
  }
}
