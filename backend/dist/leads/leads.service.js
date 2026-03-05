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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
let LeadsService = class LeadsService {
    constructor(pool) {
        this.pool = pool;
    }
    async findAll(pipelineId, stageId) {
        let query = `
            SELECT l.* 
            FROM leads l
            LEFT JOIN students s ON l.email = s.email AND s.deleted_at IS NULL
            WHERE l.deleted_at IS NULL 
            AND s.id IS NULL
        `;
        const params = [];
        if (pipelineId) {
            params.push(pipelineId);
            query += ` AND l.pipeline_id = $${params.length}`;
        }
        if (stageId) {
            params.push(stageId);
            query += ` AND l.stage_id = $${params.length}`;
        }
        query += ' ORDER BY l.created_at DESC';
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async create(leadData) {
        const { firstName, lastName, email, phone, pipelineId, stageId, assignedTo, sedeId, source, programInterestId, campaign, score, tags, notes, address } = leadData;
        const res = await this.pool.query(`INSERT INTO leads (
                first_name, last_name, email, phone, pipeline_id, stage_id, 
                assigned_to, sede_id, source, program_interest_id, campaign, score, tags, notes, address, document_type, document_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *`, [
            firstName, lastName, email, phone, pipelineId, stageId,
            assignedTo, sedeId, source, programInterestId, campaign, score || 0, tags || [], notes, address, leadData.documentType || 'CEDULA', leadData.documentId
        ]);
        return res.rows[0];
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        let i = 1;
        const mapping = {
            firstName: 'first_name',
            lastName: 'last_name',
            email: 'email',
            phone: 'phone',
            pipelineId: 'pipeline_id',
            stageId: 'stage_id',
            assignedTo: 'assigned_to',
            sedeId: 'sede_id',
            source: 'source',
            programInterestId: 'program_interest_id',
            campaign: 'campaign',
            score: 'score',
            tags: 'tags',
            notes: 'notes',
            address: 'address',
            documentType: 'document_type',
            documentId: 'document_id'
        };
        for (const [key, dbField] of Object.entries(mapping)) {
            if (data[key] !== undefined) {
                fields.push(`${dbField} = $${i++}`);
                values.push(data[key]);
            }
        }
        if (fields.length === 0)
            return null;
        values.push(id);
        const query = `UPDATE leads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`;
        const res = await this.pool.query(query, values);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Lead not found');
        return res.rows[0];
    }
    async createPublic(leadData) {
        const { firstName, lastName, email, phone, source } = leadData;
        const pipelineRes = await this.pool.query('SELECT id FROM lead_pipelines ORDER BY is_default DESC, created_at ASC LIMIT 1');
        if (pipelineRes.rows.length === 0)
            throw new common_1.NotFoundException('No pipeline found');
        const pipelineId = pipelineRes.rows[0].id;
        const stageRes = await this.pool.query('SELECT id FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY position ASC LIMIT 1', [pipelineId]);
        if (stageRes.rows.length === 0)
            throw new common_1.NotFoundException('No stages found for pipeline');
        const stageId = stageRes.rows[0].id;
        return this.create({
            firstName,
            lastName,
            email,
            phone,
            address: leadData.address,
            documentType: leadData.documentType || 'CEDULA',
            documentId: leadData.documentId,
            pipelineId,
            stageId,
            source: source || 'WEB_PUBLIC'
        });
    }
    async updateStage(leadId, stageId) {
        const res = await this.pool.query('UPDATE leads SET stage_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [stageId, leadId]);
        if (res.rows.length === 0) {
            throw new common_1.NotFoundException('Lead not found');
        }
        return res.rows[0];
    }
    async remove(id) {
        const res = await this.pool.query('UPDATE leads SET deleted_at = NOW() WHERE id = $1 RETURNING id', [id]);
        if (res.rows.length === 0) {
            throw new common_1.NotFoundException('Lead not found');
        }
        return res.rows[0];
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], LeadsService);
//# sourceMappingURL=leads.service.js.map