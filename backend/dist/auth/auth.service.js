"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcryptjs"));
const mail_service_1 = require("../common/mail.service");
const iredmail_service_1 = require("../integrations/iredmail.service");
let AuthService = class AuthService {
    constructor(pool, jwtService, mailService, iredMailService) {
        this.pool = pool;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.iredMailService = iredMailService;
    }
    async register(userData) {
        const { email, password, firstName, lastName, first_name, last_name, role } = userData;
        const finalFirstName = firstName || first_name;
        const finalLastName = lastName || last_name;
        const checkRes = await this.pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            throw new common_1.ConflictException('User already exists');
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const roleName = role || 'comercial';
        const roleRes = await this.pool.query("SELECT id FROM roles WHERE name = $1", [roleName]);
        let roleId = roleRes.rows[0]?.id;
        if (!roleId) {
            const defaultRoleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'comercial'");
            roleId = defaultRoleRes.rows[0]?.id;
        }
        const insertRes = await this.pool.query('INSERT INTO users (email, password_hash, first_name, last_name, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name', [email, passwordHash, finalFirstName, finalLastName, roleId]);
        const user = insertRes.rows[0];
        try {
            await this.iredMailService.createAccount(user.email, password, `${user.first_name} ${user.last_name}`);
            if (userData.contact_email) {
                await this.mailService.sendWelcomeEmail(userData.contact_email, user.first_name, { email: user.email, password: password });
            }
        }
        catch (mailError) {
            console.error('Failed to create iRedMail account:', mailError);
        }
        return user;
    }
    async login(loginData) {
        const { email, password } = loginData;
        const res = await this.pool.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1', [email]);
        const user = res.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async updateUser(id, updateData, isProfileUpdate = false) {
        const { roleId, isActive, first_name, last_name, phone, address, avatar_url, email, password } = updateData;
        if (isProfileUpdate) {
            const res = await this.pool.query(`UPDATE users 
                 SET first_name = COALESCE($1, first_name), 
                     last_name = COALESCE($2, last_name),
                     phone = COALESCE($3, phone),
                     address = COALESCE($4, address),
                     avatar_url = COALESCE($5, avatar_url),
                     updated_at = NOW() 
                 WHERE id = $6 RETURNING id, email, first_name, last_name, phone, address, avatar_url`, [first_name, last_name, phone, address, avatar_url, id]);
            return res.rows[0];
        }
        if (email) {
            const emailCheck = await this.pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
            if (emailCheck.rows.length > 0) {
                throw new common_1.ConflictException('Email already in use by another user');
            }
        }
        let passwordHash = undefined;
        if (password) {
            const salt = await bcrypt.genSalt();
            passwordHash = await bcrypt.hash(password, salt);
        }
        const res = await this.pool.query(`UPDATE users 
             SET role_id = COALESCE($1, role_id), 
                 is_active = COALESCE($2, is_active),
                 email = COALESCE($3, email),
                 first_name = COALESCE($4, first_name),
                 last_name = COALESCE($5, last_name),
                 password_hash = COALESCE($6, password_hash),
                 updated_at = NOW() 
             WHERE id = $7 RETURNING id, email, first_name, last_name`, [roleId, isActive, email, first_name, last_name, passwordHash, id]);
        return res.rows[0];
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool,
        jwt_1.JwtService,
        mail_service_1.MailService,
        iredmail_service_1.IRedMailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map