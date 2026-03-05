import { Injectable, Inject } from '@nestjs/common';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';
import { StorageService } from '../common/storage.service';

@Injectable()
export class SettingsService {
    constructor(
        @Inject(PG_POOL) private readonly pool: Pool,
        private readonly storageService: StorageService
    ) { }

    async getSettings() {
        const res = await this.pool.query('SELECT * FROM company_settings LIMIT 1');
        return res.rows[0] || { company_name: 'EduCRM', primary_color: '#2563eb' };
    }

    async updateSettings(settings: any, logoFile?: any) {
        const { company_name, primary_color, address, phone, website, invoice_header, invoice_footer } = settings;
        let logo_url = settings.logo_url;

        if (logoFile) {
            const { filename } = await this.storageService.saveFile(logoFile, 'settings');
            logo_url = `/uploads/settings/${filename}`;
        }

        // Check if settings exist
        const checkRes = await this.pool.query('SELECT id FROM company_settings LIMIT 1');

        if (checkRes.rows.length === 0) {
            const insertRes = await this.pool.query(
                'INSERT INTO company_settings (company_name, logo_url, primary_color, address, phone, website, invoice_header, invoice_footer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [company_name, logo_url, primary_color, address, phone, website, invoice_header, invoice_footer]
            );
            return insertRes.rows[0];
        } else {
            const updateRes = await this.pool.query(
                'UPDATE company_settings SET company_name = $1, logo_url = $2, primary_color = $3, address = $4, phone = $5, website = $6, invoice_header = $7, invoice_footer = $8, updated_at = NOW() RETURNING *',
                [company_name, logo_url, primary_color, address, phone, website, invoice_header, invoice_footer]
            );
            return updateRes.rows[0];
        }
    }
}
