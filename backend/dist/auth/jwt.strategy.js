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
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("../database/database.module");
const pg_1 = require("pg");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, pool) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'defaultSecret'
        });
        this.configService = configService;
        this.pool = pool;
    }
    async validate(payload) {
        const res = await this.pool.query(`SELECT u.id, u.email, u.is_active, r.name as role 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = $1`, [payload.sub]);
        const user = res.rows[0];
        if (!user || !user.is_active) {
            throw new common_1.UnauthorizedException('Usuario inactivo o no encontrado');
        }
        return {
            id: user.id,
            email: user.email,
            role: user.role
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(database_module_1.PG_POOL)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        pg_1.Pool])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map