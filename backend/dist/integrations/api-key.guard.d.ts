import { CanActivate, ExecutionContext } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
export declare class ApiKeyGuard implements CanActivate {
    private integrationsService;
    constructor(integrationsService: IntegrationsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
