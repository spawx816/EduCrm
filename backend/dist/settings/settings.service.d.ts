import { Pool } from 'pg';
import { StorageService } from '../common/storage.service';
export declare class SettingsService {
    private readonly pool;
    private readonly storageService;
    constructor(pool: Pool, storageService: StorageService);
    getSettings(): Promise<any>;
    updateSettings(settings: any, logoFile?: any): Promise<any>;
}
