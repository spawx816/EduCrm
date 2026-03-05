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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("./leads.service");
const lead_attachments_service_1 = require("./lead-attachments.service");
const platform_express_1 = require("@nestjs/platform-express");
let LeadsController = class LeadsController {
    constructor(leadsService, attachmentsService) {
        this.leadsService = leadsService;
        this.attachmentsService = attachmentsService;
    }
    async findAll(pipelineId, stageId) {
        return this.leadsService.findAll(pipelineId, stageId);
    }
    async create(leadData) {
        return this.leadsService.create(leadData);
    }
    async createPublic(leadData) {
        return this.leadsService.createPublic(leadData);
    }
    async updateStage(id, stageId) {
        return this.leadsService.updateStage(id, stageId);
    }
    async update(id, data) {
        return this.leadsService.update(id, data);
    }
    async remove(id) {
        return this.leadsService.remove(id);
    }
    async addAttachment(id, file) {
        return this.attachmentsService.addAttachment(id, file);
    }
    async getAttachments(id) {
        return this.attachmentsService.findByLead(id);
    }
    async removeAttachment(id) {
        return this.attachmentsService.remove(id);
    }
    async downloadAttachment(filename, res) {
        const filePath = this.attachmentsService.getFilePath(filename);
        return res.sendFile(filePath);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('pipelineId')),
    __param(1, (0, common_1.Query)('stageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('public'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "createPublic", null);
__decorate([
    (0, common_1.Patch)(':id/stage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('stageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "updateStage", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Get)(':id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getAttachments", null);
__decorate([
    (0, common_1.Delete)('attachments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "removeAttachment", null);
__decorate([
    (0, common_1.Get)('attachments/download/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "downloadAttachment", null);
exports.LeadsController = LeadsController = __decorate([
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService,
        lead_attachments_service_1.LeadAttachmentsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map