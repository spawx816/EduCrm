import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.calendarService.findAll(req.user.role);
  }

  @Post()
  @Roles('admin')
  @UseGuards(RolesGuard)
  async create(@Body() data: any, @Req() req: any) {
    return this.calendarService.create(data, req.user.id);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.calendarService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }
}
