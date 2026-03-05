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
exports.AcademicController = void 0;
const common_1 = require("@nestjs/common");
const academic_service_1 = require("./academic.service");
let AcademicController = class AcademicController {
    constructor(academicService) {
        this.academicService = academicService;
    }
    async findAllSedes() {
        return this.academicService.findAllSedes();
    }
    async findAllPrograms() {
        return this.academicService.findAllPrograms();
    }
    async findProgramById(id) {
        return this.academicService.findProgramById(id);
    }
    async createProgram(data) {
        return this.academicService.createProgram(data);
    }
    async updateProgram(id, data) {
        return this.academicService.updateProgram(id, data);
    }
    async deleteProgram(id) {
        return this.academicService.deleteProgram(id);
    }
    async findModulesByProgram(programId) {
        return this.academicService.findModulesByProgram(programId);
    }
    async createModule(data) {
        return this.academicService.createModule(data);
    }
    async updateModule(id, data) {
        return this.academicService.updateModule(id, data);
    }
    async deleteModule(id) {
        return this.academicService.deleteModule(id);
    }
    async getModuleAddons(id) {
        return this.academicService.getModuleAddons(id);
    }
    async addModuleAddon(id, itemId) {
        return this.academicService.addModuleAddon(id, itemId);
    }
    async removeModuleAddon(id, itemId) {
        return this.academicService.removeModuleAddon(id, itemId);
    }
    async findAllCohorts(programId) {
        return this.academicService.findAllCohorts(programId);
    }
    async createCohort(data) {
        return this.academicService.createCohort(data);
    }
    async updateCohort(id, data) {
        return this.academicService.updateCohort(id, data);
    }
    async deleteCohort(id) {
        return this.academicService.deleteCohort(id);
    }
    async getCohortModules(cohortId) {
        return this.academicService.getCohortModules(cohortId);
    }
    async assignInstructor(data) {
        return this.academicService.assignInstructorToModule(data);
    }
    async findInstructors() {
        return this.academicService.findInstructors();
    }
    async registerAttendance(data) {
        return this.academicService.registerAttendance(data);
    }
    async getCohortAttendance(cohortId, moduleId, date) {
        return this.academicService.getCohortAttendance(cohortId, moduleId, date);
    }
    async findGradeTypes(programId, moduleId) {
        return this.academicService.findGradeTypes(programId, moduleId);
    }
    async createGradeType(data) {
        return this.academicService.createGradeType(data);
    }
    async registerGrades(data) {
        return this.academicService.registerGrades(data);
    }
    async getCohortGrades(cohortId, moduleId) {
        return this.academicService.getCohortGrades(cohortId, moduleId);
    }
    async getCohortStudents(cohortId) {
        return this.academicService.getCohortStudents(cohortId);
    }
    async getInstructorCohorts(teacherId) {
        return this.academicService.getInstructorCohorts(teacherId);
    }
    async getInstructorModules(cohortId, teacherId) {
        return this.academicService.getInstructorModules(teacherId, cohortId);
    }
};
exports.AcademicController = AcademicController;
__decorate([
    (0, common_1.Get)('sedes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "findAllSedes", null);
__decorate([
    (0, common_1.Get)('programs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "findAllPrograms", null);
__decorate([
    (0, common_1.Get)('programs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "findProgramById", null);
__decorate([
    (0, common_1.Post)('programs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "createProgram", null);
__decorate([
    (0, common_1.Patch)('programs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "updateProgram", null);
__decorate([
    (0, common_1.Delete)('programs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "deleteProgram", null);
__decorate([
    (0, common_1.Get)('programs/:programId/modules'),
    __param(0, (0, common_1.Param)('programId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "findModulesByProgram", null);
__decorate([
    (0, common_1.Post)('modules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "createModule", null);
__decorate([
    (0, common_1.Patch)('modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "updateModule", null);
__decorate([
    (0, common_1.Delete)('modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "deleteModule", null);
__decorate([
    (0, common_1.Get)('modules/:id/addons'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getModuleAddons", null);
__decorate([
    (0, common_1.Post)('modules/:id/addons'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "addModuleAddon", null);
__decorate([
    (0, common_1.Delete)('modules/:id/addons/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "removeModuleAddon", null);
__decorate([
    (0, common_1.Get)('cohorts'),
    __param(0, (0, common_1.Query)('programId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "findAllCohorts", null);
__decorate([
    (0, common_1.Post)('cohorts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "createCohort", null);
__decorate([
    (0, common_1.Patch)('cohorts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "updateCohort", null);
__decorate([
    (0, common_1.Delete)('cohorts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "deleteCohort", null);
__decorate([
    (0, common_1.Get)('cohorts/:cohortId/modules'),
    __param(0, (0, common_1.Param)('cohortId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getCohortModules", null);
__decorate([
    (0, common_1.Post)('cohorts/assign-instructor'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "assignInstructor", null);
__decorate([
    (0, common_1.Get)('instructors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "findInstructors", null);
__decorate([
    (0, common_1.Post)('attendance'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "registerAttendance", null);
__decorate([
    (0, common_1.Get)('attendance/:cohortId'),
    __param(0, (0, common_1.Param)('cohortId')),
    __param(1, (0, common_1.Query)('moduleId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getCohortAttendance", null);
__decorate([
    (0, common_1.Get)('grade-types/:programId'),
    __param(0, (0, common_1.Param)('programId')),
    __param(1, (0, common_1.Query)('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "findGradeTypes", null);
__decorate([
    (0, common_1.Post)('grade-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "createGradeType", null);
__decorate([
    (0, common_1.Post)('grades'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "registerGrades", null);
__decorate([
    (0, common_1.Get)('grades/:cohortId'),
    __param(0, (0, common_1.Param)('cohortId')),
    __param(1, (0, common_1.Query)('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getCohortGrades", null);
__decorate([
    (0, common_1.Get)('cohorts/:cohortId/students'),
    __param(0, (0, common_1.Param)('cohortId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getCohortStudents", null);
__decorate([
    (0, common_1.Get)('instructor/cohorts/:teacherId'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getInstructorCohorts", null);
__decorate([
    (0, common_1.Get)('instructor/cohorts/:cohortId/modules/:teacherId'),
    __param(0, (0, common_1.Param)('cohortId')),
    __param(1, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getInstructorModules", null);
exports.AcademicController = AcademicController = __decorate([
    (0, common_1.Controller)('academic'),
    __metadata("design:paramtypes", [academic_service_1.AcademicService])
], AcademicController);
//# sourceMappingURL=academic.controller.js.map