import { Controller, Get, Param } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('portal-exams')
export class PortalExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Get('assignments/:cohortId')
    async getCohortAssignments(@Param('cohortId') cohortId: string) {
        return this.examsService.getCohortAssignments(cohortId);
    }

    @Get('attempts/:studentId')
    async getStudentAttempts(@Param('studentId') studentId: string) {
        return this.examsService.getStudentAttempts(studentId);
    }
}
