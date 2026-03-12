import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentCardsService } from './student-cards.service';
import { StudentCardsController } from './student-cards.controller';
import { DatabaseModule } from '../database/database.module';
import { StorageService } from '../common/storage.service';
import { IntegrationsModule } from '../integrations/integrations.module';

import { DiplomasService } from './diplomas.service';

@Module({
  imports: [DatabaseModule, IntegrationsModule],
  providers: [StudentsService, StudentCardsService, DiplomasService],
  controllers: [StudentsController, StudentCardsController],
  exports: [StudentCardsService, DiplomasService]
})
export class StudentsModule { }
