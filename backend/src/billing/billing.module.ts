import { Module, forwardRef } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { DatabaseModule } from '../database/database.module';
import { InvoicePdfService } from './invoice-pdf.service';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => StudentsModule)],
  providers: [BillingService, InvoicePdfService],
  controllers: [BillingController]
})
export class BillingModule { }
