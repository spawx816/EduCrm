import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    updateUser(id: string, updateData: any): Promise<any>;
}
