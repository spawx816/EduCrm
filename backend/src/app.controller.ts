import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('routes-debug')
  getRoutes() {
    return {
      message: 'Registered routes (internal names):',
      routes: [
        'POST /auth/login',
        'GET /billing/invoices',
        'GET /billing/test-status',
        'DELETE /billing/invoices/:id',
        'DELETE /billing/instructor-payments/:id',
        'GET /students'
      ]
    };
  }
}
