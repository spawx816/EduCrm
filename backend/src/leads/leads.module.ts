import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadAttachmentsService } from './lead-attachments.service';
import { DatabaseModule } from '../database/database.module';
import { StorageService } from '../common/storage.service';

@Module({
  imports: [DatabaseModule],
  providers: [LeadsService, LeadAttachmentsService, StorageService],
  controllers: [LeadsController],
})
export class LeadsModule { }
