import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { DatabaseModule } from '../database/database.module';
import { StorageService } from '../common/storage.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [DatabaseModule, IntegrationsModule],
  providers: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule { }
