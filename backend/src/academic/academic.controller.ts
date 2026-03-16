import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { AcademicService } from './academic.service';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) { }

  @Get('sedes')
  async findAllSedes() {
    return this.academicService.findAllSedes();
  }

  @Get('programs')
  async findAllPrograms() {
    return this.academicService.findAllPrograms();
  }

  @Get('programs/:id')
  async findProgramById(@Param('id') id: string) {
    return this.academicService.findProgramById(id);
  }

  @Post('programs')
  async createProgram(@Body() data: any) {
    return this.academicService.createProgram(data);
  }

  @Patch('programs/:id')
  async updateProgram(@Param('id') id: string, @Body() data: any) {
    return this.academicService.updateProgram(id, data);
  }

  @Delete('programs/:id')
  async deleteProgram(@Param('id') id: string) {
    return this.academicService.deleteProgram(id);
  }

  @Get('programs/:programId/modules')
  async findModulesByProgram(@Param('programId') programId: string) {
    return this.academicService.findModulesByProgram(programId);
  }

  @Post('modules')
  async createModule(@Body() data: any) {
    return this.academicService.createModule(data);
  }

  @Patch('modules/:id')
  async updateModule(@Param('id') id: string, @Body() data: any) {
    return this.academicService.updateModule(id, data);
  }

  @Delete('modules/:id')
  async deleteModule(@Param('id') id: string) {
    return this.academicService.deleteModule(id);
  }

  // Module Addons
  @Get('modules/:id/addons')
  async getModuleAddons(@Param('id') id: string) {
    return this.academicService.getModuleAddons(id);
  }

  @Post('modules/:id/addons')
  async addModuleAddon(@Param('id') id: string, @Body('itemId') itemId: string) {
    return this.academicService.addModuleAddon(id, itemId);
  }

  @Delete('modules/:id/addons/:itemId')
  async removeModuleAddon(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.academicService.removeModuleAddon(id, itemId);
  }

  // Cohorts
  @Get('cohorts')
  async findAllCohorts(@Query('programId') programId?: string) {
    return this.academicService.findAllCohorts(programId);
  }

  @Post('cohorts')
  async createCohort(@Body() data: any) {
    return this.academicService.createCohort(data);
  }

  @Patch('cohorts/:id')
  async updateCohort(@Param('id') id: string, @Body() data: any) {
    return this.academicService.updateCohort(id, data);
  }

  @Delete('cohorts/:id')
  async deleteCohort(@Param('id') id: string) {
    return this.academicService.deleteCohort(id);
  }

  @Get('cohorts/:cohortId/modules')
  async getCohortModules(@Param('cohortId') cohortId: string) {
    return this.academicService.getCohortModules(cohortId);
  }

  @Post('cohorts/assign-instructor')
  async assignInstructor(@Body() data: any) {
    return this.academicService.assignInstructorToModule(data);
  }

  @Get('instructors')
  async findInstructors() {
    return this.academicService.findInstructors();
  }

  // Attendance
  @Post('attendance')
  async registerAttendance(@Body() data: any) {
    return this.academicService.registerAttendance(data);
  }

  @Get('attendance/:cohortId')
  async getCohortAttendance(
    @Param('cohortId') cohortId: string,
    @Query('moduleId') moduleId?: string,
    @Query('date') date?: string
  ) {
    return this.academicService.getCohortAttendance(cohortId, moduleId, date);
  }

  // Grades
  @Get('grade-types/:programId')
  async findGradeTypes(@Param('programId') programId: string, @Query('moduleId') moduleId?: string, @Query('studentId') studentId?: string) {
    return this.academicService.findGradeTypes(programId, moduleId, studentId);
  }

  @Post('grade-types')
  async createGradeType(@Body() data: any) {
    return this.academicService.createGradeType(data);
  }

  @Post('grades')
  async registerGrades(@Body() data: any) {
    return this.academicService.registerGrades(data);
  }

  @Get('grades/:cohortId')
  async getCohortGrades(@Param('cohortId') cohortId: string, @Query('moduleId') moduleId?: string) {
    return this.academicService.getCohortGrades(cohortId, moduleId);
  }

  @Get('cohorts/:cohortId/students')
  async getCohortStudents(@Param('cohortId') cohortId: string) {
    return this.academicService.getCohortStudents(cohortId);
  }

  @Get('instructor/cohorts/:teacherId')
  async getInstructorCohorts(@Param('teacherId') teacherId: string) {
    return this.academicService.getInstructorCohorts(teacherId);
  }

  @Get('instructor/cohorts/:cohortId/modules/:teacherId')
  async getInstructorModules(
    @Param('cohortId') cohortId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.academicService.getInstructorModules(teacherId, cohortId);
  }
}
