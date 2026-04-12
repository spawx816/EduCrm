import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PortalExamsController } from './portal-exams.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [ExamsService],
    controllers: [ExamsController, PortalExamsController],
    exports: [ExamsService],
})
export class ExamsModule { }
