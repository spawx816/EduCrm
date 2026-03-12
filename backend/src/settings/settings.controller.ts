import { Controller, Get, Patch, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Get('test-status')
    async test() {
        return { status: 'ok', message: 'SettingsController is live' };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch()
    @UseInterceptors(FileInterceptor('logo'))
    async updateSettings(
        @Body() settings: any,
        @UploadedFile() logo?: any
    ) {
        return this.settingsService.updateSettings(settings, logo);
    }
}
