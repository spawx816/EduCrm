export declare class StorageService {
    private readonly baseUploadPath;
    constructor();
    saveFile(file: any, folder?: string): Promise<{
        filename: string;
        path: string;
    }>;
    deleteFile(filename: string, folder?: string): Promise<void>;
    getFilePath(filename: string, folder?: string): string;
}
