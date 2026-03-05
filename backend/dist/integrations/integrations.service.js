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
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
const chat_gateway_1 = require("./chat.gateway");
let IntegrationsService = class IntegrationsService {
    constructor(pool, chatGateway) {
        this.pool = pool;
        this.chatGateway = chatGateway;
        this.runMaintenanceSql().catch(err => console.error('Auto maintenance failed', err));
    }
    async createApiKey(name, serviceName) {
        const key = `ak_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        const res = await this.pool.query(`INSERT INTO api_keys (key, name, service_name) VALUES ($1, $2, $3) RETURNING *`, [key, name, serviceName]);
        return res.rows[0];
    }
    async findAllKeys() {
        const res = await this.pool.query('SELECT id, key, name, service_name, is_active, created_at, last_used_at FROM api_keys ORDER BY created_at DESC');
        return res.rows;
    }
    async revokeKey(id) {
        await this.pool.query('UPDATE api_keys SET is_active = false WHERE id = $1', [id]);
        return { success: true };
    }
    async validateKey(key) {
        const res = await this.pool.query('SELECT * FROM api_keys WHERE key = $1 AND is_active = true', [key]);
        if (res.rows.length === 0)
            return null;
        await this.pool.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [res.rows[0].id]);
        return res.rows[0];
    }
    async processExternalLead(leadData, source) {
        const pipelineRes = await this.pool.query('SELECT id FROM lead_pipelines ORDER BY is_default DESC, created_at ASC LIMIT 1');
        if (pipelineRes.rows.length === 0)
            throw new common_1.NotFoundException('No pipeline found');
        const pipelineId = pipelineRes.rows[0].id;
        const stageRes = await this.pool.query('SELECT id FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY position ASC LIMIT 1', [pipelineId]);
        if (stageRes.rows.length === 0)
            throw new common_1.NotFoundException('No stages found for pipeline');
        const stageId = stageRes.rows[0].id;
        const { firstName, lastName, email, phone } = leadData;
        const res = await this.pool.query(`INSERT INTO leads (first_name, last_name, email, phone, pipeline_id, stage_id, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [firstName || 'Lead', lastName || 'Externo', email, phone, pipelineId, stageId, source]);
        return res.rows[0];
    }
    async handleIncomingMessage(externalId, source, content, senderMetadata) {
        let conversationId;
        const convRes = await this.pool.query('SELECT id, lead_id FROM chat_conversations WHERE external_id = $1 AND source = $2', [externalId, source]);
        if (convRes.rows.length > 0) {
            conversationId = convRes.rows[0].id;
            await this.pool.query('UPDATE chat_conversations SET last_message_at = NOW() WHERE id = $1', [conversationId]);
        }
        else {
            let leadId = await this.findLeadByContactInfo(senderMetadata.phone, senderMetadata.email);
            if (!leadId) {
                const lead = await this.processExternalLead({
                    firstName: senderMetadata.name || 'Chat User',
                    lastName: source.toUpperCase(),
                    phone: senderMetadata.phone,
                    email: senderMetadata.email
                }, source);
                leadId = lead.id;
            }
            const newConv = await this.pool.query(`INSERT INTO chat_conversations (external_id, source, lead_id, metadata)
                 VALUES ($1, $2, $3, $4) RETURNING id`, [externalId, source, leadId, senderMetadata]);
            conversationId = newConv.rows[0].id;
        }
        const msgRes = await this.pool.query(`INSERT INTO chat_messages (conversation_id, sender_type, content, message_type, metadata)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`, [conversationId, 'lead', content, senderMetadata.message_type || senderMetadata.type || 'text', senderMetadata]);
        const message = msgRes.rows[0];
        this.chatGateway.notifyNewMessage(message);
        return message;
    }
    async findLeadByContactInfo(phone, email) {
        if (!phone && !email)
            return null;
        const res = await this.pool.query('SELECT id FROM leads WHERE (phone = $1 AND phone IS NOT NULL) OR (email = $2 AND email IS NOT NULL) LIMIT 1', [phone, email]);
        return res.rows.length > 0 ? res.rows[0].id : null;
    }
    async getConversations() {
        try {
            const res = await this.pool.query(`
                SELECT 
                    c.id, c.external_id, c.source, c.lead_id, c.status, c.last_message_at, c.created_at, c.metadata,
                    l.first_name, l.last_name 
                FROM chat_conversations c
                LEFT JOIN leads l ON c.lead_id = l.id
                ORDER BY c.last_message_at DESC
            `);
            return res.rows;
        }
        catch (error) {
            console.error('Error in getConversations:', error);
            throw error;
        }
    }
    async getConversationByLeadId(leadId) {
        try {
            const res = await this.pool.query('SELECT * FROM chat_conversations WHERE lead_id = $1 LIMIT 1', [leadId]);
            return res.rows[0];
        }
        catch (error) {
            console.error('Error in getConversationByLeadId:', error);
            throw error;
        }
    }
    async getMessages(conversationId) {
        try {
            const res = await this.pool.query('SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC', [conversationId]);
            return res.rows;
        }
        catch (error) {
            console.error('Error in getMessages:', error);
            throw error;
        }
    }
    async sendReply(conversationId, content, userId) {
        const convRes = await this.pool.query('SELECT * FROM chat_conversations WHERE id = $1', [conversationId]);
        if (convRes.rows.length === 0)
            throw new common_1.NotFoundException('Conversation not found');
        const conversation = convRes.rows[0];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const validUserId = uuidRegex.test(userId) ? userId : null;
        const res = await this.pool.query(`INSERT INTO chat_messages (conversation_id, sender_type, sender_id, content, message_type)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`, [conversationId, 'user', validUserId, content, 'text']);
        const message = res.rows[0];
        await this.pool.query('UPDATE chat_conversations SET last_message_at = NOW() WHERE id = $1', [conversationId]);
        this.chatGateway.notifyNewMessage(message);
        console.log(`Sending reply to conversation ${conversationId}. Source: ${conversation.source}, ExternalID: ${conversation.external_id}`);
        if (conversation.source?.toLowerCase() === 'whatsapp' && conversation.external_id) {
            console.log(`Dispatched WhatsApp message via Evolution API to ${conversation.external_id}`);
            this.sendEvolutionMessage(conversation.external_id, content).catch(err => console.error('Failed to send WhatsApp message via Evolution API', err));
        }
        else if ((conversation.source?.toLowerCase() === 'facebook' || conversation.source?.toLowerCase() === 'instagram') && conversation.external_id) {
            console.log(`Dispatched Meta message (${conversation.source}) to ${conversation.external_id}`);
            this.sendMetaMessage(conversation.external_id, content, conversation.source.toLowerCase()).catch(err => console.error(`Failed to send ${conversation.source} message via Meta API`, err));
        }
        else {
            console.warn(`Message not sent to external API. Conditions not met. Source: ${conversation.source}`);
        }
        return message;
    }
    async handleEvolutionWebhook(payload) {
        if (payload.event !== 'messages.upsert')
            return { received: true };
        const messageData = payload.data;
        console.log('Evolution Webhook Data Incoming:', JSON.stringify(messageData, null, 2));
        if (messageData.key.fromMe)
            return { received: true };
        const externalId = messageData.key.remoteJid;
        const pushName = payload.sender || messageData.pushName || 'WhatsApp User';
        let content = '';
        let messageType = 'text';
        let mediaData = null;
        if (messageData.message?.conversation) {
            content = messageData.message.conversation;
        }
        else if (messageData.message?.extendedTextMessage?.text) {
            content = messageData.message.extendedTextMessage.text;
        }
        else if (messageData.message?.imageMessage) {
            content = messageData.message.imageMessage.caption || '';
            messageType = 'image';
            const b64 = messageData.message?.base64 || messageData.base64 || payload.base64;
            console.log(`Image Detected. Found Base64? ${!!b64}. Length: ${b64?.length || 0}`);
            mediaData = {
                mimetype: messageData.message.imageMessage.mimetype,
                base64: b64
            };
        }
        if (!content && !mediaData)
            return { received: true };
        const phone = externalId.split('@')[0];
        return this.handleIncomingMessage(externalId, 'whatsapp', content, {
            phone,
            name: pushName,
            message_type: messageType,
            media: mediaData,
            evolution_payload: payload
        });
    }
    async handleMetaWebhook(payload) {
        console.log('Meta Webhook Data Incoming:', JSON.stringify(payload, null, 2));
        if (payload.object !== 'page' && payload.object !== 'instagram')
            return { received: true };
        for (const entry of payload.entry) {
            const messaging = entry.messaging || entry.changes;
            if (!messaging)
                continue;
            for (const event of messaging) {
                if (event.message && !event.message.is_echo) {
                    const senderId = event.sender.id;
                    const content = event.message.text || '';
                    const source = payload.object === 'page' ? 'facebook' : 'instagram';
                    const metadata = {
                        name: `Meta User ${senderId}`,
                        message_type: 'text',
                        meta_payload: event
                    };
                    await this.handleIncomingMessage(senderId, source, content, metadata);
                }
            }
        }
        return { received: true };
    }
    async sendMetaMessage(recipientId, content, source) {
        const token = process.env.META_PAGE_ACCESS_TOKEN;
        if (!token) {
            console.error('META_PAGE_ACCESS_TOKEN not configured');
            return;
        }
        const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${token}`;
        const body = {
            recipient: { id: recipientId },
            message: { text: content },
            messaging_type: 'RESPONSE'
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (!response.ok) {
                console.error(`Error sending Meta message:`, data);
            }
            else {
                console.log(`Meta message sent successfully:`, data);
            }
        }
        catch (error) {
            console.error('Failed to dispatch Meta message:', error);
        }
    }
    async sendEvolutionMessage(remoteJid, text) {
        const rawUrl = process.env.EVOLUTION_API_URL || '';
        const apiUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
        const apiKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE_NAME;
        if (!apiUrl || !apiKey || !instance) {
            console.warn('Evolution API not configured. Message skipped.');
            return;
        }
        try {
            const cleanNumber = remoteJid.includes('@') ? remoteJid.split('@')[0] : remoteJid;
            console.log(`Fetching Evolution API: ${apiUrl}/message/sendText/${instance}`);
            console.log(`Message payload - Number: ${cleanNumber}, Text length: ${text.length}`);
            const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey
                },
                body: JSON.stringify({
                    number: cleanNumber,
                    text: text,
                    delay: 1200,
                    linkPreview: false
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Evolution API Error Response: ${errorText}`);
                throw new Error(`Evolution API error: ${errorText}`);
            }
            const result = await response.json();
            console.log('Evolution API success:', result);
            return result;
        }
        catch (error) {
            console.error('Evolution API Fetch Exception:', error);
            throw error;
        }
    }
    async runMaintenanceSql() {
        console.log('Running maintenance SQL (Enhanced)...');
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                external_id VARCHAR(255),
                source VARCHAR(50) NOT NULL,
                lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
                status VARCHAR(20) DEFAULT 'OPEN',
                metadata JSONB DEFAULT '{}',
                last_message_at TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(external_id, source)
            );
        `);
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
                sender_type VARCHAR(20) NOT NULL,
                sender_id UUID,
                content TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                metadata JSONB DEFAULT '{}',
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        await this.pool.query(`
            ALTER TABLE chat_messages 
            ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text',
            ADD COLUMN IF NOT EXISTS sender_id UUID,
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
        `);
        await this.pool.query(`
            ALTER TABLE chat_conversations
            ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'OPEN';
        `);
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS lead_attachments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                mimetype VARCHAR(100),
                size INTEGER,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                key VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                service_name VARCHAR(100),
                is_active BOOLEAN DEFAULT true,
                last_used_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        await this.pool.query(`
            ALTER TABLE api_keys
            ADD COLUMN IF NOT EXISTS service_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        `);
        await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead_id ON chat_conversations(lead_id);`);
        await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);`);
        await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_lead_attachments_lead_id ON lead_attachments(lead_id);`);
        await this.pool.query(`CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);`);
        console.log('Database schema maintenance completed.');
        return { success: true, message: 'Database schema synchronized' };
    }
    async createConversationManual(leadId, source) {
        const leadRes = await this.pool.query('SELECT phone, first_name, last_name FROM leads WHERE id = $1', [leadId]);
        if (leadRes.rows.length === 0)
            throw new common_1.NotFoundException('Lead not found');
        const lead = leadRes.rows[0];
        const externalId = source === 'whatsapp' ? lead.phone : `manual_${leadId}`;
        const exists = await this.pool.query('SELECT id FROM chat_conversations WHERE lead_id = $1 AND source = $2', [leadId, source]);
        if (exists.rows.length > 0)
            return exists.rows[0];
        const res = await this.pool.query(`INSERT INTO chat_conversations (external_id, source, lead_id, metadata)
             VALUES ($1, $2, $3, $4) RETURNING *`, [externalId, source, leadId, { name: `${lead.first_name} ${lead.last_name}`, phone: lead.phone }]);
        return res.rows[0];
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool,
        chat_gateway_1.ChatGateway])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map