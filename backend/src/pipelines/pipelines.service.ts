import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';

@Injectable()
export class PipelinesService {
    constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

    async findAll() {
        const res = await this.pool.query('SELECT * FROM lead_pipelines ORDER BY created_at DESC');
        return res.rows;
    }

    async findOne(id: string) {
        const pipelineRes = await this.pool.query('SELECT * FROM lead_pipelines WHERE id = $1', [id]);
        if (pipelineRes.rows.length === 0) {
            throw new NotFoundException('Pipeline not found');
        }

        const stagesRes = await this.pool.query(
            'SELECT * FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY position ASC',
            [id]
        );

        return {
            ...pipelineRes.rows[0],
            stages: stagesRes.rows,
        };
    }

    async updateStage(id: string, data: { name?: string; color?: string; is_won?: boolean; is_lost?: boolean }) {
        const fields: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${i++}`);
            values.push(data.name);
        }
        if (data.color !== undefined) {
            fields.push(`color = $${i++}`);
            values.push(data.color);
        }
        if (data.is_won !== undefined) {
            fields.push(`is_won = $${i++}`);
            values.push(data.is_won);
        }
        if (data.is_lost !== undefined) {
            fields.push(`is_lost = $${i++}`);
            values.push(data.is_lost);
        }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE pipeline_stages SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`;

        const res = await this.pool.query(query, values);
        if (res.rows.length === 0) throw new NotFoundException('Stage not found');
        return res.rows[0];
    }

    async deleteStage(id: string) {
        const res = await this.pool.query('DELETE FROM pipeline_stages WHERE id = $1 RETURNING *', [id]);
        if (res.rows.length === 0) throw new NotFoundException('Stage not found');
        return res.rows[0];
    }
}
