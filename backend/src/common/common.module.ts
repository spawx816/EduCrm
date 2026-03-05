import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { StorageService } from './storage.service';

@Global()
@Module({
    providers: [MailService, StorageService],
    exports: [MailService, StorageService],
})
export class CommonModule { }
