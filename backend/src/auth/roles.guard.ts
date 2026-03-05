import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no roles are required, allow access
        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('A token must be provided to perform this action.');
        }

        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException(`Access denied. Requires one of roles: [${requiredRoles.join(', ')}]. You have: ${user.role}`);
        }

        return true;
    }
}
