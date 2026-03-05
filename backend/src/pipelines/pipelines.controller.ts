import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';

@Controller('pipelines')
export class PipelinesController {
    constructor(private readonly pipelinesService: PipelinesService) { }

    @Get()
    async findAll() {
        return this.pipelinesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.pipelinesService.findOne(id);
    }

    @Patch('stages/:id')
    async updateStage(@Param('id') id: string, @Body() data: any) {
        return this.pipelinesService.updateStage(id, data);
    }

    @Delete('stages/:id')
    async deleteStage(@Param('id') id: string) {
        return this.pipelinesService.deleteStage(id);
    }
}
