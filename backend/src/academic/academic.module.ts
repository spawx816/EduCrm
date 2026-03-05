import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AcademicService],
  controllers: [AcademicController],
})
export class AcademicModule { }
