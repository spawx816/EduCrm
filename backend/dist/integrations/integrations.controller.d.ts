import { IntegrationsService } from './integrations.service';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    getAllKeys(): Promise<any[]>;
    createKey(body: {
        name: string;
        serviceName?: string;
    }): Promise<any>;
    revokeKey(id: string): Promise<{
        success: boolean;
    }>;
    handleWebhook(leadData: any, req: any): Promise<any>;
    getConversations(): Promise<any[]>;
    getConversationByLeadId(leadId: string): Promise<any>;
    getMessages(id: string): Promise<any[]>;
    sendReply(id: string, body: {
        content: string;
        userId: string;
    }): Promise<any>;
    startConversation(body: {
        leadId: string;
        source: 'whatsapp' | 'instagram' | 'web';
    }): Promise<any>;
    simulateWhatsApp(body: {
        from: string;
        name: string;
        message: string;
    }): Promise<any>;
    handleEvolutionWebhook(body: any): Promise<any>;
    simulateInstagram(body: {
        username: string;
        message: string;
    }): Promise<any>;
    verifyMetaWebhook(req: any): Promise<any>;
    handleMetaWebhook(body: any): Promise<{
        received: boolean;
    }>;
}
