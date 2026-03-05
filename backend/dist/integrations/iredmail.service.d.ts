import { ConfigService } from '@nestjs/config';
export declare class IRedMailService {
    private configService;
    constructor(configService: ConfigService);
    private executeSSH;
    createAccount(email: string, password: string, name: string): Promise<{
        success: boolean;
        email: string;
    }>;
    deleteAccount(email: string): Promise<{
        success: boolean;
    }>;
}
