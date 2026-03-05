import { Module } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { PipelinesController } from './pipelines.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [PipelinesService],
  controllers: [PipelinesController],
})
export class PipelinesModule { }
