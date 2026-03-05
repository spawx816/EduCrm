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
exports.AcademicService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
let AcademicService = class AcademicService {
    constructor(pool) {
        this.pool = pool;
    }
    async findAllSedes() {
        const res = await this.pool.query('SELECT * FROM sedes WHERE is_active = true ORDER BY name ASC');
        return res.rows;
    }
    async findAllPrograms() {
        const res = await this.pool.query('SELECT * FROM academic_programs WHERE deleted_at IS NULL ORDER BY name ASC');
        return res.rows;
    }
    async findProgramById(id) {
        const res = await this.pool.query('SELECT * FROM academic_programs WHERE id = $1 AND deleted_at IS NULL', [id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Program not found');
        return res.rows[0];
    }
    async createProgram(data) {
        const { name, description, code, enrollment_price = 0, billing_day = 5 } = data;
        const res = await this.pool.query('INSERT INTO academic_programs (name, description, code, enrollment_price, billing_day) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, code, enrollment_price, billing_day]);
        return res.rows[0];
    }
    async updateProgram(id, data) {
        const { name, description, code, is_active, enrollment_price, billing_day } = data;
        const res = await this.pool.query(`UPDATE academic_programs 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           code = COALESCE($3, code), 
           is_active = COALESCE($4, is_active),
           enrollment_price = COALESCE($5, enrollment_price),
           billing_day = COALESCE($6, billing_day),
           updated_at = NOW() 
       WHERE id = $7 AND deleted_at IS NULL 
       RETURNING *`, [name, description, code, is_active, enrollment_price, billing_day, id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Program not found');
        return res.rows[0];
    }
    async deleteProgram(id) {
        const res = await this.pool.query('UPDATE academic_programs SET deleted_at = NOW() WHERE id = $1 RETURNING id', [id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Program not found');
        return res.rows[0];
    }
    async findAllCohorts(programId) {
        let query = 'SELECT c.*, p.name as program_name FROM academic_cohorts c JOIN academic_programs p ON c.program_id = p.id WHERE c.deleted_at IS NULL';
        const params = [];
        if (programId) {
            params.push(programId);
            query += ` AND c.program_id = $${params.length}`;
        }
        query += ' ORDER BY c.start_date DESC';
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async createCohort(data) {
        const { program_id, name } = data;
        const start_date = data.start_date || null;
        const end_date = data.end_date || null;
        const res = await this.pool.query('INSERT INTO academic_cohorts (program_id, name, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *', [program_id, name, start_date, end_date]);
        return res.rows[0];
    }
    async updateCohort(id, data) {
        const { name, is_active } = data;
        const start_date = data.start_date === '' ? null : (data.start_date || undefined);
        const end_date = data.end_date === '' ? null : (data.end_date || undefined);
        const res = await this.pool.query(`UPDATE academic_cohorts 
       SET name = COALESCE($1, name), 
           start_date = COALESCE($2, start_date), 
           end_date = COALESCE($3, end_date), 
           is_active = COALESCE($4, is_active),
           updated_at = NOW() 
       WHERE id = $5 AND deleted_at IS NULL 
       RETURNING *`, [name, start_date, end_date, is_active, id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Cohort not found');
        return res.rows[0];
    }
    async deleteCohort(id) {
        const res = await this.pool.query('UPDATE academic_cohorts SET deleted_at = NOW() WHERE id = $1 RETURNING id', [id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Cohort not found');
        return res.rows[0];
    }
    async findModulesByProgram(programId) {
        const res = await this.pool.query('SELECT * FROM academic_modules WHERE program_id = $1 AND deleted_at IS NULL ORDER BY order_index ASC', [programId]);
        return res.rows;
    }
    async createModule(data) {
        const { program_id, name, description, order_index = 0, price = 0 } = data;
        const res = await this.pool.query('INSERT INTO academic_modules (program_id, name, description, order_index, price) VALUES ($1, $2, $3, $4, $5) RETURNING *', [program_id, name, description, order_index, price]);
        return res.rows[0];
    }
    async updateModule(id, data) {
        const { name, description, order_index, price } = data;
        const res = await this.pool.query(`UPDATE academic_modules 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           order_index = COALESCE($3, order_index), 
           price = COALESCE($4, price),
           updated_at = NOW() 
       WHERE id = $5 AND deleted_at IS NULL 
       RETURNING *`, [name, description, order_index, price, id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Module not found');
        return res.rows[0];
    }
    async deleteModule(id) {
        const res = await this.pool.query('UPDATE academic_modules SET deleted_at = NOW() WHERE id = $1 RETURNING id', [id]);
        if (res.rows.length === 0)
            throw new common_1.NotFoundException('Module not found');
        return res.rows[0];
    }
    async addModuleAddon(moduleId, itemId) {
        const res = await this.pool.query('INSERT INTO academic_module_addons (module_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *', [moduleId, itemId]);
        return res.rows[0];
    }
    async removeModuleAddon(moduleId, itemId) {
        await this.pool.query('DELETE FROM academic_module_addons WHERE module_id = $1 AND item_id = $2', [moduleId, itemId]);
        return { success: true };
    }
    async getModuleAddons(moduleId) {
        const res = await this.pool.query(`SELECT bi.* 
       FROM academic_module_addons ama
       JOIN billing_items bi ON ama.item_id = bi.id
       WHERE ama.module_id = $1`, [moduleId]);
        return res.rows;
    }
    async assignInstructorToModule(data) {
        const { cohort_id, module_id, teacher_id } = data;
        const start_date = data.start_date || null;
        const end_date = data.end_date || null;
        const res = await this.pool.query(`INSERT INTO academic_cohort_modules (cohort_id, module_id, teacher_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (cohort_id, module_id)
       DO UPDATE SET teacher_id = EXCLUDED.teacher_id, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, updated_at = NOW()
       RETURNING *`, [cohort_id, module_id, teacher_id, start_date, end_date]);
        return res.rows[0];
    }
    async getCohortModules(cohortId) {
        const res = await this.pool.query(`SELECT cm.*, m.name as module_name, u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM academic_cohort_modules cm
       JOIN academic_modules m ON cm.module_id = m.id
       LEFT JOIN users u ON cm.teacher_id = u.id
       WHERE cm.cohort_id = $1`, [cohortId]);
        return res.rows;
    }
    async registerAttendance(data) {
        const { cohort_id, module_id, date, records } = data;
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            for (const record of records) {
                await client.query(`INSERT INTO attendance (student_id, cohort_id, module_id, date, status, remarks)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (student_id, cohort_id, date, module_id) 
           DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, updated_at = NOW()`, [record.student_id, cohort_id, module_id, date, record.status, record.remarks]);
            }
            await client.query('COMMIT');
            return { success: true, count: records.length };
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getCohortAttendance(cohortId, module_id, date) {
        let query = 'SELECT a.*, s.first_name, s.last_name FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.cohort_id = $1';
        const params = [cohortId];
        if (module_id) {
            params.push(module_id);
            query += ` AND a.module_id = $${params.length}`;
        }
        if (date) {
            params.push(date);
            query += ` AND a.date = $${params.length}`;
        }
        query += ' ORDER BY a.date DESC, s.last_name ASC';
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async findGradeTypes(programId, module_id) {
        let query = 'SELECT * FROM grade_types WHERE program_id = $1';
        const params = [programId];
        if (module_id) {
            params.push(module_id);
            query += ` AND module_id = $${params.length}`;
        }
        query += ' ORDER BY created_at ASC';
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async createGradeType(data) {
        const { program_id, module_id, name, weight = 1.0 } = data;
        const res = await this.pool.query('INSERT INTO grade_types (program_id, module_id, name, weight) VALUES ($1, $2, $3, $4) RETURNING *', [program_id, module_id, name, weight]);
        return res.rows[0];
    }
    async registerGrades(data) {
        const { cohort_id, module_id, grade_type_id, records } = data;
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            for (const record of records) {
                await client.query(`INSERT INTO grades (student_id, cohort_id, module_id, grade_type_id, value, remarks)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (student_id, cohort_id, module_id, grade_type_id)
           DO UPDATE SET value = EXCLUDED.value, remarks = EXCLUDED.remarks, updated_at = NOW()
           RETURNING *`, [record.student_id, cohort_id, module_id, grade_type_id, record.value, record.remarks]);
            }
            await client.query('COMMIT');
            return { success: true, count: records.length };
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getCohortGrades(cohortId, module_id) {
        let query = `
       SELECT g.*, s.first_name, s.last_name, gt.name as grade_type_name
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN grade_types gt ON g.grade_type_id = gt.id
       WHERE g.cohort_id = $1`;
        const params = [cohortId];
        if (module_id) {
            params.push(module_id);
            query += ` AND g.module_id = $${params.length}`;
        }
        query += ' ORDER BY gt.created_at ASC, s.last_name ASC';
        const res = await this.pool.query(query, params);
        return res.rows;
    }
    async findInstructors() {
        const res = await this.pool.query(`SELECT u.id, u.first_name, u.last_name, u.email 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE r.name = 'docente' AND u.deleted_at IS NULL`);
        return res.rows;
    }
    async getInstructorCohorts(teacherId) {
        const res = await this.pool.query(`SELECT DISTINCT c.*, p.name as program_name
       FROM academic_cohorts c
       JOIN academic_programs p ON c.program_id = p.id
       JOIN academic_cohort_modules cm ON c.id = cm.cohort_id
       WHERE cm.teacher_id = $1 AND c.deleted_at IS NULL`, [teacherId]);
        return res.rows;
    }
    async getInstructorModules(teacherId, cohortId) {
        const res = await this.pool.query(`SELECT cm.*, m.name as module_name, m.description as module_description
       FROM academic_cohort_modules cm
       JOIN academic_modules m ON cm.module_id = m.id
       WHERE cm.teacher_id = $1 AND cm.cohort_id = $2`, [teacherId, cohortId]);
        return res.rows;
    }
    async getCohortStudents(cohortId) {
        const res = await this.pool.query(`SELECT s.*, e.enrollment_date, e.status as enrollment_status
       FROM students s
       JOIN enrollments e ON s.id = e.student_id
       WHERE e.cohort_id = $1 AND s.deleted_at IS NULL
       ORDER BY s.last_name ASC, s.first_name ASC`, [cohortId]);
        return res.rows;
    }
};
exports.AcademicService = AcademicService;
exports.AcademicService = AcademicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], AcademicService);
//# sourceMappingURL=academic.service.js.map