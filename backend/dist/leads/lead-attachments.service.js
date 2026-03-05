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
exports.LeadAttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
const storage_service_1 = require("../common/storage.service");
let LeadAttachmentsService = class LeadAttachmentsService {
    constructor(pool, storageService) {
        this.pool = pool;
        this.storageService = storageService;
    }
    async addAttachment(leadId, file) {
        const { filename } = await this.storageService.saveFile(file);
        const res = await this.pool.query(`INSERT INTO lead_attachments (lead_id, filename, original_name, mimetype, size)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`, [leadId, filename, file.originalname, file.mimetype, file.size]);
        return res.rows[0];
    }
    async findByLead(leadId) {
        const res = await this.pool.query('SELECT * FROM lead_attachments WHERE lead_id = $1 ORDER BY created_at DESC', [leadId]);
        return res.rows;
    }
    async remove(id) {
        const res = await this.pool.query('DELETE FROM lead_attachments WHERE id = $1 RETURNING filename', [id]);
        if (res.rows.length === 0) {
            throw new common_1.NotFoundException('Adjunto no encontrado');
        }
        const { filename } = res.rows[0];
        await this.storageService.deleteFile(filename);
        return { success: true };
    }
    getFilePath(filename) {
        return this.storageService.getFilePath(filename);
    }
};
exports.LeadAttachmentsService = LeadAttachmentsService;
exports.LeadAttachmentsService = LeadAttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool,
        storage_service_1.StorageService])
], LeadAttachmentsService);
//# sourceMappingURL=lead-attachments.service.js.map