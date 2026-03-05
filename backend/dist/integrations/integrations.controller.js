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
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const integrations_service_1 = require("./integrations.service");
const api_key_guard_1 = require("./api-key.guard");
let IntegrationsController = class IntegrationsController {
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    async getAllKeys() {
        return this.integrationsService.findAllKeys();
    }
    async createKey(body) {
        return this.integrationsService.createApiKey(body.name, body.serviceName);
    }
    async revokeKey(id) {
        return this.integrationsService.revokeKey(id);
    }
    async handleWebhook(leadData, req) {
        const keyData = req['apiKeyMetadata'];
        const source = keyData.service_name || 'EXTERNAL_API';
        return this.integrationsService.processExternalLead(leadData, source);
    }
    async getConversations() {
        return this.integrationsService.getConversations();
    }
    async getConversationByLeadId(leadId) {
        return this.integrationsService.getConversationByLeadId(leadId);
    }
    async getMessages(id) {
        return this.integrationsService.getMessages(id);
    }
    async sendReply(id, body) {
        return this.integrationsService.sendReply(id, body.content, body.userId);
    }
    async startConversation(body) {
        return this.integrationsService.createConversationManual(body.leadId, body.source);
    }
    async simulateWhatsApp(body) {
        return this.integrationsService.handleIncomingMessage(body.from, 'whatsapp', body.message, { phone: body.from, name: body.name });
    }
    async handleEvolutionWebhook(body) {
        return this.integrationsService.handleEvolutionWebhook(body);
    }
    async simulateInstagram(body) {
        return this.integrationsService.handleIncomingMessage(body.username, 'instagram', body.message, { name: body.username });
    }
    async verifyMetaWebhook(req) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode && token) {
            if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
                console.log('META_WEBHOOK_VERIFIED');
                return challenge;
            }
        }
        return 'Verification failed';
    }
    async handleMetaWebhook(body) {
        return this.integrationsService.handleMetaWebhook(body);
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)('keys'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getAllKeys", null);
__decorate([
    (0, common_1.Post)('keys'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "createKey", null);
__decorate([
    (0, common_1.Delete)('keys/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "revokeKey", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/by-lead/:leadId'),
    __param(0, (0, common_1.Param)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getConversationByLeadId", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:id/reply'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "sendReply", null);
__decorate([
    (0, common_1.Post)('conversations/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "startConversation", null);
__decorate([
    (0, common_1.Post)('webhooks/whatsapp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "simulateWhatsApp", null);
__decorate([
    (0, common_1.Post)(['webhooks/evolution', 'webhooks/evolution/:event']),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "handleEvolutionWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/instagram'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "simulateInstagram", null);
__decorate([
    (0, common_1.Get)('webhooks/meta'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "verifyMetaWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/meta'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "handleMetaWebhook", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map