import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Put, Delete, Patch } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Get()
    async getAllExams() {
        return this.examsService.getAllExams();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Post()
    async createExam(@Body() data: any, @Request() req: any) {
        return this.examsService.createExam({ ...data, created_by: req.user.id });
    }

    @Get('module/:moduleId')
    async getModuleExams(@Param('moduleId') moduleId: string) {
        return this.examsService.getModuleExams(moduleId);
    }

    @Get(':id')
    async getExamDetail(@Param('id') id: string) {
        return this.examsService.getExamDetail(id);
    }

    @Get('attempts/:attemptId/detail')
    async getAttemptDetail(@Param('attemptId') attemptId: string) {
        return this.examsService.getAttemptDetail(attemptId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Post(':id/questions')
    async addQuestion(@Param('id') id: string, @Body() data: any) {
        return this.examsService.addQuestion(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Put(':id')
    async updateExam(@Param('id') id: string, @Body() data: any) {
        return this.examsService.updateExam(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Delete(':id')
    async deleteExam(@Param('id') id: string) {
        return this.examsService.deleteExam(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Put('questions/:id')
    async updateQuestion(@Param('id') id: string, @Body() data: any) {
        return this.examsService.updateQuestion(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Delete('questions/:id')
    async deleteQuestion(@Param('id') id: string) {
        return this.examsService.deleteQuestion(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Post('assign')
    async assignExam(@Body() data: any) {
        return this.examsService.assignExam(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director', 'docente')
    @Patch('assignments/:id/schedule')
    async updateAssignmentSchedule(@Param('id') id: string, @Body() data: { start_date: string; end_date: string }) {
        return this.examsService.updateAssignmentSchedule(id, data.start_date, data.end_date);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'director')
    @Get('assignments')
    async getAllAssignments() {
        return this.examsService.getAllAssignments();
    }

    @Get('cohort/:cohortId/assignments')
    async getCohortAssignments(@Param('cohortId') cohortId: string) {
        return this.examsService.getCohortAssignments(cohortId);
    }

    @Get('assignments/:assignmentId/results')
    async getAssignmentResults(@Param('assignmentId') assignmentId: string) {
        return this.examsService.getAssignmentResults(assignmentId);
    }

    @Post('attempts/start')
    async startAttempt(@Body() data: { studentId: string; assignmentId: string }) {
        return this.examsService.startAttempt(data.studentId, data.assignmentId);
    }

    @Post('attempts/:attemptId/submit')
    async submitAttempt(@Param('attemptId') attemptId: string, @Body() data: { answers: any[] }) {
        return this.examsService.submitAttempt(attemptId, data.answers);
    }

    @Get('student/:studentId/attempts')
    async getStudentAttempts(@Param('studentId') studentId: string) {
        return this.examsService.getStudentAttempts(studentId);
    }
}
