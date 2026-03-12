import { Controller, Get, Post, Body, Param, Put, UseGuards, UnauthorizedException } from '@nestjs/common';
import { StudentCardsService } from './student-cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('student-cards')
@UseGuards(JwtAuthGuard)
export class StudentCardsController {
    constructor(private readonly studentCardsService: StudentCardsService) { }

    @Get()
    findAll() {
        return this.studentCardsService.findAll();
    }

    @Get('student/:studentId')
    findByStudent(@Param('studentId') studentId: string) {
        return this.studentCardsService.findByStudentId(studentId);
    }

    @Post('generate')
    generate(@Body() data: { studentId: string }) {
        return this.studentCardsService.generateCard(data.studentId);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() data: { status: string }) {
        return this.studentCardsService.updateStatus(id, data.status);
    }
}
