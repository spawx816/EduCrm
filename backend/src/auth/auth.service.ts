import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../common/mail.service';
import { IRedMailService } from '../integrations/iredmail.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(PG_POOL) private readonly pool: Pool,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly iredMailService: IRedMailService,
    ) { }

    async register(userData: any) {
        const { email, password, firstName, lastName, first_name, last_name, role } = userData;
        const finalFirstName = firstName || first_name;
        const finalLastName = lastName || last_name;

        // Check if user exists
        const checkRes = await this.pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            throw new ConflictException('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // Get role ID based on the input role or fallback to comercial
        const roleName = role || 'comercial';
        const roleRes = await this.pool.query("SELECT id FROM roles WHERE name = $1", [roleName]);

        let roleId = roleRes.rows[0]?.id;

        // Safety check if role didn't exist
        if (!roleId) {
            const defaultRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'comercial'");
            roleId = defaultRoleRes.rows[0]?.id;
        }

        const insertRes = await this.pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name',
            [email, passwordHash, finalFirstName, finalLastName, roleId]
        );
        const user = insertRes.rows[0];

        // iRedMail Integration
        try {
            // Use the same password for the mail account as the one used for registration (optional)
            // Or generate a temp one. For security, maybe temp is better if we send it to an external email.
            // But here we might not have an external email if they use the institucional one to register.
            // If they are registering with the institucional email, we create it.
            await this.iredMailService.createAccount(user.email, password, `${user.first_name} ${user.last_name}`);
            // Note: We can't send the email to the account we JUST created yet (maybe), 
            // but usually we have a contact email. If userData has a 'contact_email', we use it.
            if (userData.contact_email) {
                await this.mailService.sendWelcomeEmail(userData.contact_email, user.first_name, { email: user.email, password: password });
            }
        } catch (mailError) {
            console.error('Failed to create iRedMail account:', mailError);
        }

        return user;
    }

    async login(loginData: any) {
        const { email, password } = loginData;

        const res = await this.pool.query(
            'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1',
            [email]
        );
        const user = res.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role_name
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role_name
            }
        };
    }

    async getUsers() {
        const res = await this.pool.query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, r.name as role_name, r.display_name as role_display_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `);
        return res.rows;
    }

    async getRoles() {
        const res = await this.pool.query('SELECT id, name, display_name FROM roles ORDER BY display_name ASC');
        return res.rows;
    }

    async updateUser(id: string, updateData: any) {
        const { roleId, isActive } = updateData;
        const res = await this.pool.query(
            'UPDATE users SET role_id = $1, is_active = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email',
            [roleId, isActive, id]
        );
        return res.rows[0];
    }
}

