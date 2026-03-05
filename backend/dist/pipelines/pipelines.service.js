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
exports.PipelinesService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
let PipelinesService = class PipelinesService {
    constructor(pool) {
        this.pool = pool;
    }
    async findAll() {
        const res = await this.pool.query('SELECT * FROM lead_pipelines ORDER BY created_at DESC');
        return res.rows;
    }
    async findOne(id) {
        const pipelineRes = await this.pool.query('SELECT * FROM lead_pipelines WHERE id = $1', [id]);
        if (pipelineRes.rows.length === 0) {
            throw new common_1.NotFoundException('Pipeline not found');
        }
        const stagesRes = await this.pool.query('SELECT * FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY position ASC', [id]);
        return {
            ...pipelineRes.rows[0],
            stages: stagesRes.rows,
        };
    }
    async updateStage(id, data) {
        const fields = [];
        const values = [];
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
        if (fields.length === 0)
            return null;
        values.push(id);
        const query = `UPDATE pipeline_stages SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`;
        const res = await this.pool.query(query, values);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Stage not found');
        return res.rows[0];
    }
    async deleteStage(id) {
        const res = await this.pool.query('DELETE FROM pipeline_stages WHERE id = $1 RETURNING *', [id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Stage not found');
        return res.rows[0];
    }
};
exports.PipelinesService = PipelinesService;
exports.PipelinesService = PipelinesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], PipelinesService);
//# sourceMappingURL=pipelines.service.js.map