import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { AcademicModule } from './academic/academic.module';
import { StudentsModule } from './students/students.module';
import { BillingModule } from './billing/billing.module';
import { StatsModule } from './stats/stats.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ExamsModule } from './exams/exams.module';
import { SettingsModule } from './settings/settings.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    DatabaseModule,
    AuthModule,
    LeadsModule,
    PipelinesModule,
    AcademicModule,
    StudentsModule,
    BillingModule,
    StatsModule,
    IntegrationsModule,
    ExamsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

