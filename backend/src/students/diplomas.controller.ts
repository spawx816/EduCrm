import { Controller, Get, Post, Param, Res, UseGuards } from '@nestjs/common';
import { DiplomasService } from './diplomas.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('diplomas')
export class DiplomasController {
    constructor(private readonly diplomasService: DiplomasService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.diplomasService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('student/:studentId')
    async findByStudentId(@Param('studentId') studentId: string) {
        return this.diplomasService.findByStudentId(studentId);
    }

    // Public or protected download? Keeping it protected for now.
    @UseGuards(JwtAuthGuard)
    @Get(':id/pdf')
    async downloadPdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.diplomasService.getDiplomaPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=diploma-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
