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
exports.ExamsController = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("./exams.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ExamsController = class ExamsController {
    constructor(examsService) {
        this.examsService = examsService;
    }
    async createExam(data, req) {
        return this.examsService.createExam({ ...data, created_by: req.user.id });
    }
    async getModuleExams(moduleId) {
        return this.examsService.getModuleExams(moduleId);
    }
    async getExamDetail(id) {
        return this.examsService.getExamDetail(id);
    }
    async getAttemptDetail(attemptId) {
        return this.examsService.getAttemptDetail(attemptId);
    }
    async addQuestion(id, data) {
        return this.examsService.addQuestion(id, data);
    }
    async updateExam(id, data) {
        return this.examsService.updateExam(id, data);
    }
    async deleteExam(id) {
        return this.examsService.deleteExam(id);
    }
    async updateQuestion(id, data) {
        return this.examsService.updateQuestion(id, data);
    }
    async deleteQuestion(id) {
        return this.examsService.deleteQuestion(id);
    }
    async assignExam(data) {
        return this.examsService.assignExam(data);
    }
    async updateAssignmentSchedule(id, data) {
        return this.examsService.updateAssignmentSchedule(id, data.start_date, data.end_date);
    }
    async getCohortAssignments(cohortId) {
        return this.examsService.getCohortAssignments(cohortId);
    }
    async getAssignmentResults(assignmentId) {
        return this.examsService.getAssignmentResults(assignmentId);
    }
    async startAttempt(data) {
        return this.examsService.startAttempt(data.studentId, data.assignmentId);
    }
    async submitAttempt(attemptId, data) {
        return this.examsService.submitAttempt(attemptId, data.answers);
    }
    async getStudentAttempts(studentId) {
        return this.examsService.getStudentAttempts(studentId);
    }
};
exports.ExamsController = ExamsController;
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'director'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "createExam", null);
__decorate([
    (0, common_1.Get)('module/:moduleId'),
    __param(0, (0, common_1.Param)('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getModuleExams", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getExamDetail", null);
__decorate([
    (0, common_1.Get)('attempts/:attemptId/detail'),
    __param(0, (0, common_1.Param)('attemptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getAttemptDetail", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'director'),
    (0, common_1.Post)(':id/questions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "addQuestion", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'director'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "updateExam", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'director'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "deleteExam", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'director'),
    (0, common_1.Put)('questions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "updateQuestion", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'director'),
    (0, common_1.Delete)('questions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "deleteQuestion", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'director'),
    (0, common_1.Post)('assign'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "assignExam", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'director', 'docente'),
    (0, common_1.Patch)('assignments/:id/schedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "updateAssignmentSchedule", null);
__decorate([
    (0, common_1.Get)('cohort/:cohortId/assignments'),
    __param(0, (0, common_1.Param)('cohortId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getCohortAssignments", null);
__decorate([
    (0, common_1.Get)('assignments/:assignmentId/results'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getAssignmentResults", null);
__decorate([
    (0, common_1.Post)('attempts/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "startAttempt", null);
__decorate([
    (0, common_1.Post)('attempts/:attemptId/submit'),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "submitAttempt", null);
__decorate([
    (0, common_1.Get)('student/:studentId/attempts'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getStudentAttempts", null);
exports.ExamsController = ExamsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('exams'),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], ExamsController);
//# sourceMappingURL=exams.controller.js.map