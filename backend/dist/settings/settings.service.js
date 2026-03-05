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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
const storage_service_1 = require("../common/storage.service");
let SettingsService = class SettingsService {
    constructor(pool, storageService) {
        this.pool = pool;
        this.storageService = storageService;
    }
    async getSettings() {
        const res = await this.pool.query('SELECT * FROM company_settings LIMIT 1');
        return res.rows[0] || { company_name: 'EduCRM', primary_color: '#2563eb' };
    }
    async updateSettings(settings, logoFile) {
        const { company_name, primary_color, address, phone, website, invoice_header, invoice_footer } = settings;
        let logo_url = settings.logo_url;
        if (logoFile) {
            const { filename } = await this.storageService.saveFile(logoFile, 'settings');
            logo_url = `/uploads/settings/${filename}`;
        }
        const checkRes = await this.pool.query('SELECT id FROM company_settings LIMIT 1');
        if (checkRes.rows.length === 0) {
            const insertRes = await this.pool.query('INSERT INTO company_settings (company_name, logo_url, primary_color, address, phone, website, invoice_header, invoice_footer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [company_name, logo_url, primary_color, address, phone, website, invoice_header, invoice_footer]);
            return insertRes.rows[0];
        }
        else {
            const updateRes = await this.pool.query('UPDATE company_settings SET company_name = $1, logo_url = $2, primary_color = $3, address = $4, phone = $5, website = $6, invoice_header = $7, invoice_footer = $8, updated_at = NOW() RETURNING *', [company_name, logo_url, primary_color, address, phone, website, invoice_header, invoice_footer]);
            return updateRes.rows[0];
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool,
        storage_service_1.StorageService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map