import { Controller, Get, Post, Patch, Body, Param, NotFoundException, Query, UseInterceptors, UploadedFile, Delete, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { DiplomasService } from './diplomas.service';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly diplomasService: DiplomasService
  ) { }

  // Diploma Endpoints (Moved above :id to avoid shadowing)
  @Get('diplomas/student/:studentId')
  async getStudentDiplomas(@Param('studentId') studentId: string) {
    return this.diplomasService.findByStudentId(studentId);
  }

  @Get('test-status')
  testStatus() {
    return { status: 'ok', message: 'StudentsController is live' };
  }

  @Get('diplomas/:id/pdf')
  async downloadDiplomaPdf(@Param('id') id: string, @Res() res: any) {
    const buffer = await this.diplomasService.getDiplomaPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=diploma-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sede_id') sede_id?: string
  ) {
    return this.studentsService.findAll({ search, status, sede_id });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.studentsService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.update(id, data);
  }

  @Post('convert/:leadId')
  async convertLead(@Param('leadId') leadId: string) {
    return this.studentsService.convertLead(leadId);
  }

  @Post('enroll')
  async enroll(@Body() data: any) {
    return this.studentsService.enroll(data);
  }

  @Delete('enrollments/:id')
  async deleteEnrollment(@Param('id') id: string) {
    return this.studentsService.deleteEnrollment(id);
  }

  @Get(':id/full-history')
  async getFullHistory(@Param('id') id: string) {
    return this.studentsService.getFullHistory(id);
  }

  // Portal Endpoints
  @Post('portal/login')
  async portalLogin(@Body() data: { matricula: string; email: string }) {
    const student = await this.studentsService.loginPortal(data.matricula, data.email);
    if (!student) throw new NotFoundException('Credenciales inválidas para el portal');
    return student;
  }

  @Get('portal/me/:id')
  async getPortalProfile(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get('portal/invoices/:studentId')
  async getPortalInvoices(@Param('studentId') studentId: string) {
    return this.studentsService.getPortalInvoices(studentId);
  }

  @Get('portal/academic/:studentId')
  async getPortalAcademic(@Param('studentId') studentId: string) {
    return this.studentsService.getPortalAcademic(studentId);
  }

  @Get('portal/attendance/:studentId')
  async getPortalAttendance(@Param('studentId') studentId: string) {
    return this.studentsService.getPortalAttendance(studentId);
  }

  @Get('portal/grades/:studentId')
  async getPortalGrades(@Param('studentId') studentId: string) {
    return this.studentsService.getPortalGrades(studentId);
  }

  // Attachment Endpoints
  @Get(':id/attachments')
  async getAttachments(@Param('id') id: string) {
    return this.studentsService.getAttachments(id);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: any
  ) {
    return this.studentsService.uploadAttachment(id, file);
  }

  @Delete('attachments/:id')
  async deleteAttachment(@Param('id') id: string) {
    return this.studentsService.deleteAttachment(id);
  }

  // Avatar Endpoint
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: any
  ) {
    return this.studentsService.uploadAvatar(id, file);
  }

}
