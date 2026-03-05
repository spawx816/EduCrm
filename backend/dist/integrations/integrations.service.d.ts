import { Pool } from 'pg';
import { ChatGateway } from './chat.gateway';
export declare class IntegrationsService {
    private readonly pool;
    private readonly chatGateway;
    constructor(pool: Pool, chatGateway: ChatGateway);
    createApiKey(name: string, serviceName?: string): Promise<any>;
    findAllKeys(): Promise<any[]>;
    revokeKey(id: string): Promise<{
        success: boolean;
    }>;
    validateKey(key: string): Promise<any>;
    processExternalLead(leadData: any, source: string): Promise<any>;
    handleIncomingMessage(externalId: string, source: string, content: string, senderMetadata: any): Promise<any>;
    private findLeadByContactInfo;
    getConversations(): Promise<any[]>;
    getConversationByLeadId(leadId: string): Promise<any>;
    getMessages(conversationId: string): Promise<any[]>;
    sendReply(conversationId: string, content: string, userId: string): Promise<any>;
    handleEvolutionWebhook(payload: any): Promise<any>;
    handleMetaWebhook(payload: any): Promise<{
        received: boolean;
    }>;
    sendMetaMessage(recipientId: string, content: string, source: 'facebook' | 'instagram'): Promise<void>;
    sendEvolutionMessage(remoteJid: string, text: string): Promise<any>;
    runMaintenanceSql(): Promise<{
        success: boolean;
        message: string;
    }>;
    createConversationManual(leadId: string, source: 'whatsapp' | 'instagram' | 'web'): Promise<any>;
}
