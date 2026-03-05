import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { DatabaseModule } from '../database/database.module';
import { ChatGateway } from './chat.gateway';
import { IRedMailService } from './iredmail.service';

@Module({
    imports: [DatabaseModule],
    providers: [IntegrationsService, ChatGateway, IRedMailService],
    controllers: [IntegrationsController],
    exports: [IntegrationsService, IRedMailService],
})
export class IntegrationsModule { }
