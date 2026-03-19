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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
let CalendarService = class CalendarService {
    constructor(pool) {
        this.pool = pool;
    }
    async findAll(role) {
        let query = 'SELECT * FROM calendar_events WHERE 1=1';
        const params = [];
        if (role === 'student' || role === 'docente') {
            query += " AND (visibility = 'ALL' OR visibility = $1)";
            params.push(role === 'student' ? 'ALL' : 'TEACHERS');
        }
        query += ' ORDER BY event_date ASC';
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async create(data, userId) {
        const { title, description, event_date, end_date, type, visibility } = data;
        const res = await this.pool.query(`INSERT INTO calendar_events (title, description, event_date, end_date, type, visibility, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [title, description, event_date, end_date, type || 'EVENT', visibility || 'ALL', userId]);
        return res.rows[0];
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        let i = 1;
        for (const [key, value] of Object.entries(data)) {
            if (['title', 'description', 'event_date', 'end_date', 'type', 'visibility'].includes(key)) {
                fields.push(`${key} = $${i++}`);
                values.push(value);
            }
        }
        if (fields.length === 0)
            return null;
        values.push(id);
        const query = `UPDATE calendar_events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`;
        const res = await this.pool.query(query, values);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Event not found');
        return res.rows[0];
    }
    async remove(id) {
        const res = await this.pool.query('DELETE FROM calendar_events WHERE id = $1 RETURNING id', [id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Event not found');
        return res.rows[0];
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map