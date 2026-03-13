import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<any>;
    test(): Promise<{
        status: string;
        message: string;
    }>;
    updateSettings(settings: any, logo?: any): Promise<any>;
}
