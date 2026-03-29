import { Controller, Get, Post, Patch, Body, Param, NotFoundException, Query, UseInterceptors, UploadedFile, Delete, Res, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { DiplomasService } from './diplomas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly diplomasService: DiplomasService
  ) { }

  // Diploma Endpoints (Moved above :id to avoid shadowing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'director', 'docente', 'ventas')
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sede_id') sede_id?: string
  ) {
    return this.studentsService.findAll({ search, status, sede_id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'director', 'docente', 'ventas')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'director')
  @Post()
  async create(@Body() data: any) {
    return this.studentsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'director')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'director')
  @Post('convert/:leadId')
  async convertLead(@Param('leadId') leadId: string) {
    return this.studentsService.convertLead(leadId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'director')
  @Post('enroll')
  async enroll(@Body() data: any) {
    return this.studentsService.enroll(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'director')
  @Delete('enrollments/:id')
  async deleteEnrollment(@Param('id') id: string) {
    return this.studentsService.deleteEnrollment(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'director')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: any
  ) {
    return this.studentsService.uploadAvatar(id, file);
  }


}
