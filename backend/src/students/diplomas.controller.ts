import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { DiplomasService } from './diplomas.service';

@Controller('diplomas')
export class DiplomasController {
    constructor(private readonly diplomasService: DiplomasService) { }

    @Get('all')
    async getAll() {
        return this.diplomasService.findAll();
    }

    @Get('student/:studentId')
    async getByStudent(@Param('studentId') studentId: string) {
        return this.diplomasService.findByStudentId(studentId);
    }

    @Get(':id/pdf')
    async downloadPdf(@Param('id') id: string, @Res() res: any) {
        const diplomaRes = await this.diplomasService.findAll();
        const diploma = diplomaRes.find(d => d.id === id);
        const buffer = await this.diplomasService.getDiplomaPdf(id);
        
        const safeName = diploma 
          ? `Diploma_${diploma.student_name.replace(/\s+/g, '_')}.pdf`
          : `diploma-${id}.pdf`;

        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeName}"`,
          'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
