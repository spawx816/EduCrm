import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import { MailService } from '../common/mail.service';
import { IRedMailService } from '../integrations/iredmail.service';
export declare class AuthService {
    private readonly pool;
    private readonly jwtService;
    private readonly mailService;
    private readonly iredMailService;
    constructor(pool: Pool, jwtService: JwtService, mailService: MailService, iredMailService: IRedMailService);
    register(userData: any): Promise<any>;
    login(loginData: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
    }>;
    getUsers(): Promise<any[]>;
    getRoles(): Promise<any[]>;
    updateUser(id: string, updateData: any, isProfileUpdate?: boolean): Promise<any>;
}
