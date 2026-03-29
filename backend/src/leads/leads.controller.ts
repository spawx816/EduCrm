import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFile, Res, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadAttachmentsService } from './lead-attachments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('leads')
export class LeadsController {
    constructor(
        private readonly leadsService: LeadsService,
        private readonly attachmentsService: LeadAttachmentsService,
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director', 'docente', 'ventas')
    @Get()
    async findAll(
        @Query('pipelineId') pipelineId?: string,
        @Query('stageId') stageId?: string,
    ) {
        return this.leadsService.findAll(pipelineId, stageId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director', 'ventas')
    @Post()
    async create(@Body() leadData: any) {
        return this.leadsService.create(leadData);
    }

    @Post('public')
    async createPublic(@Body() leadData: any) {
        return this.leadsService.createPublic(leadData);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director', 'ventas')
    @Patch(':id/stage')
    async updateStage(
        @Param('id') id: string,
        @Body('stageId') stageId: string,
    ) {
        return this.leadsService.updateStage(id, stageId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director', 'ventas')
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() data: any,
    ) {
        return this.leadsService.update(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.leadsService.remove(id);
    }

    // Attachments
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post(':id/attachments')
    @UseInterceptors(FileInterceptor('file'))
    async addAttachment(
        @Param('id') id: string,
        @UploadedFile() file: any,
    ) {
        return this.attachmentsService.addAttachment(id, file);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':id/attachments')
    async getAttachments(@Param('id') id: string) {
        return this.attachmentsService.findByLead(id);
    }

    @Delete('attachments/:id')
    async removeAttachment(@Param('id') id: string) {
        return this.attachmentsService.remove(id);
    }

    @Get('attachments/download/:filename')
    async downloadAttachment(
        @Param('filename') filename: string,
        @Res() res: any,
    ) {
        const filePath = this.attachmentsService.getFilePath(filename);
        return res.sendFile(filePath);
    }
}
