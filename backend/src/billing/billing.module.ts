import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { DatabaseModule } from '../database/database.module';
import { InvoicePdfService } from './invoice-pdf.service';

@Module({
  imports: [DatabaseModule],
  providers: [BillingService, InvoicePdfService],
  controllers: [BillingController]
})
export class BillingModule { }
