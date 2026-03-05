import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Put, Delete } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Post()
    async createExam(@Body() data: any) {
        return this.examsService.createExam(data);
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

    @Post(':id/questions')
    async addQuestion(@Param('id') id: string, @Body() data: any) {
        return this.examsService.addQuestion(id, data);
    }

    @Put(':id')
    async updateExam(@Param('id') id: string, @Body() data: any) {
        return this.examsService.updateExam(id, data);
    }

    @Put('questions/:id')
    async updateQuestion(@Param('id') id: string, @Body() data: any) {
        return this.examsService.updateQuestion(id, data);
    }

    @Delete('questions/:id')
    async deleteQuestion(@Param('id') id: string) {
        return this.examsService.deleteQuestion(id);
    }

    @Post('assign')
    async assignExam(@Body() data: any) {
        return this.examsService.assignExam(data);
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
