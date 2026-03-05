import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private integrationsService: IntegrationsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('API Key missing');
        }

        const keyData = await this.integrationsService.validateKey(apiKey);
        if (!keyData) {
            throw new UnauthorizedException('Invalid or inactive API Key');
        }

        // Attach key metadata to request for logging/tracking
        request['apiKeyMetadata'] = keyData;

        return true;
    }
}
