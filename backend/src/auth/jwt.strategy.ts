import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PG_POOL } from '../database/database.module';
import { Pool } from 'pg';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        @Inject(PG_POOL) private readonly pool: Pool,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret' // Handle gracefully if not set, though it should be
        });
    }

    async validate(payload: any) {
        // Query the DB to ensure the user still exists and is active, and fetch fresh role
        const res = await this.pool.query(
            `SELECT u.id, u.email, u.is_active, r.name as role 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = $1`,
            [payload.sub]
        );

        const user = res.rows[0];

        if (!user || !user.is_active) {
            throw new UnauthorizedException('Usuario inactivo o no encontrado');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role
        };
    }
}
