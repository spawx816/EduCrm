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
exports.DiplomasController = void 0;
const common_1 = require("@nestjs/common");
const diplomas_service_1 = require("./diplomas.service");
let DiplomasController = class DiplomasController {
    constructor(diplomasService) {
        this.diplomasService = diplomasService;
    }
    async getAll() {
        return this.diplomasService.findAll();
    }
    async getByStudent(studentId) {
        return this.diplomasService.findByStudentId(studentId);
    }
    async downloadPdf(id, res) {
        const diplomaRes = await this.diplomasService.findAll();
        const diploma = diplomaRes.find(d => d.id === id);
        const buffer = await this.diplomasService.getDiplomaPdf(id);
        const safeName = diploma
            ? `Diploma_${diploma.student_name.replace(/\s+/g, '_')}.pdf`
            : `diploma-${id}.pdf`;
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeName}"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.DiplomasController = DiplomasController;
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiplomasController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DiplomasController.prototype, "getByStudent", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiplomasController.prototype, "downloadPdf", null);
exports.DiplomasController = DiplomasController = __decorate([
    (0, common_1.Controller)('diplomas'),
    __metadata("design:paramtypes", [diplomas_service_1.DiplomasService])
], DiplomasController);
//# sourceMappingURL=diplomas.controller.js.map