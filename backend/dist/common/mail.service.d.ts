import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, html: string, text?: string): Promise<any>;
    sendWelcomeEmail(to: string, name: string, credentials: {
        email: string;
        password?: string;
    }): Promise<any>;
}
