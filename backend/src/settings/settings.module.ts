import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { StorageService } from '../common/storage.service';

@Module({
    providers: [SettingsService, StorageService],
    controllers: [SettingsController],
})
export class SettingsModule { }
