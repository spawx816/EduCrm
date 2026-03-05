import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
    private readonly baseUploadPath = path.join(process.cwd(), 'uploads');

    constructor() {
        if (!fs.existsSync(this.baseUploadPath)) {
            fs.mkdirSync(this.baseUploadPath, { recursive: true });
        }
    }

    async saveFile(file: any, folder: string = 'leads'): Promise<{ filename: string; path: string }> {
        const uploadPath = path.join(this.baseUploadPath, folder);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const fileExt = path.extname(file.originalname);
        const filename = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadPath, filename);

        await fs.promises.writeFile(filePath, file.buffer);

        return { filename, path: filePath };
    }

    async deleteFile(filename: string, folder: string = 'leads'): Promise<void> {
        const filePath = path.join(this.baseUploadPath, folder, filename);
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    }

    getFilePath(filename: string, folder: string = 'leads'): string {
        return path.join(this.baseUploadPath, folder, filename);
    }
}
