import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { ApiKeyGuard } from './api-key.guard';

@Controller('integrations')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) { }

    @Get('keys')
    async getAllKeys() {
        return this.integrationsService.findAllKeys();
    }

    @Post('keys')
    async createKey(@Body() body: { name: string, serviceName?: string }) {
        return this.integrationsService.createApiKey(body.name, body.serviceName);
    }

    @Delete('keys/:id')
    async revokeKey(@Param('id') id: string) {
        return this.integrationsService.revokeKey(id);
    }

    @Post('webhook')
    @UseGuards(ApiKeyGuard)
    async handleWebhook(@Body() leadData: any, @Req() req: any) {
        const keyData = req['apiKeyMetadata'];
        const source = keyData.service_name || 'EXTERNAL_API';
        return this.integrationsService.processExternalLead(leadData, source);
    }

    // --- CHAT ENDPOINTS ---

    @Get('conversations')
    async getConversations() {
        return this.integrationsService.getConversations();
    }

    @Get('conversations/by-lead/:leadId')
    async getConversationByLeadId(@Param('leadId') leadId: string) {
        return this.integrationsService.getConversationByLeadId(leadId);
    }

    @Get('conversations/:id/messages')
    async getMessages(@Param('id') id: string) {
        return this.integrationsService.getMessages(id);
    }

    @Post('conversations/:id/reply')
    async sendReply(
        @Param('id') id: string,
        @Body() body: { content: string, userId: string }
    ) {
        return this.integrationsService.sendReply(id, body.content, body.userId);
    }

    @Post('conversations/start')
    async startConversation(@Body() body: { leadId: string, source: 'whatsapp' | 'instagram' | 'web' }) {
        return this.integrationsService.createConversationManual(body.leadId, body.source);
    }

    // SIMULATED WEBHOOKS for testing
    @Post('webhooks/whatsapp')
    async simulateWhatsApp(@Body() body: { from: string, name: string, message: string }) {
        return this.integrationsService.handleIncomingMessage(
            body.from,
            'whatsapp',
            body.message,
            { phone: body.from, name: body.name }
        );
    }

    @Post(['webhooks/evolution', 'webhooks/evolution/:event'])
    async handleEvolutionWebhook(@Body() body: any) {
        return this.integrationsService.handleEvolutionWebhook(body);
    }

    @Post('webhooks/instagram')
    async simulateInstagram(@Body() body: { username: string, message: string }) {
        return this.integrationsService.handleIncomingMessage(
            body.username,
            'instagram',
            body.message,
            { name: body.username }
        );
    }

    // --- META (FACEBOOK/INSTAGRAM) REAL WEBHOOKS ---

    @Get('webhooks/meta')
    async verifyMetaWebhook(@Req() req: any) {
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

    @Post('webhooks/meta')
    async handleMetaWebhook(@Body() body: any) {
        return this.integrationsService.handleMetaWebhook(body);
    }
}
