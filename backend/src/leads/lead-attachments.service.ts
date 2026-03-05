import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';
import { StorageService } from '../common/storage.service';

@Injectable()
export class LeadAttachmentsService {
    constructor(
        @Inject(PG_POOL) private readonly pool: Pool,
        private readonly storageService: StorageService
    ) { }

    async addAttachment(leadId: string, file: any) {
        const { filename } = await this.storageService.saveFile(file);

        const res = await this.pool.query(
            `INSERT INTO lead_attachments (lead_id, filename, original_name, mimetype, size)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [leadId, filename, file.originalname, file.mimetype, file.size]
        );

        return res.rows[0];
    }

    async findByLead(leadId: string) {
        const res = await this.pool.query(
            'SELECT * FROM lead_attachments WHERE lead_id = $1 ORDER BY created_at DESC',
            [leadId]
        );
        return res.rows;
    }

    async remove(id: string) {
        const res = await this.pool.query(
            'DELETE FROM lead_attachments WHERE id = $1 RETURNING filename',
            [id]
        );

        if (res.rows.length === 0) {
            throw new NotFoundException('Adjunto no encontrado');
        }

        const { filename } = res.rows[0];
        await this.storageService.deleteFile(filename);

        return { success: true };
    }

    getFilePath(filename: string) {
        return this.storageService.getFilePath(filename);
    }
}
