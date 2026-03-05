import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'ssh2';

@Injectable()
export class IRedMailService {
    constructor(private configService: ConfigService) { }

    private async executeSSH(command: string): Promise<string> {
        const conn = new Client();
        return new Promise((resolve, reject) => {
            conn
                .on('ready', () => {
                    conn.exec(command, (err, stream) => {
                        if (err) return reject(err);
                        let output = '';
                        stream
                            .on('close', (code: number, signal: string) => {
                                conn.end();
                                if (code !== 0) {
                                    reject(new Error(`Exit code: ${code}, signal: ${signal}`));
                                } else {
                                    resolve(output);
                                }
                            })
                            .on('data', (data: Buffer) => {
                                output += data;
                            })
                            .stderr.on('data', (data) => {
                                console.error('SSH STDERR:', data.toString());
                            });
                    });
                })
                .on('error', (err) => reject(err))
                .connect({
                    host: this.configService.get<string>('IREDMAIL_SSH_HOST'),
                    port: this.configService.get<number>('IREDMAIL_SSH_PORT') || 22,
                    username: this.configService.get<string>('IREDMAIL_SSH_USER'),
                    password: this.configService.get<string>('IREDMAIL_SSH_PASS'),
                    privateKey: this.configService.get<string>('IREDMAIL_SSH_KEY'), // Optional: path or content
                });
        });
    }

    async createAccount(email: string, password: string, name: string) {
        const domain = this.configService.get<string>('IREDMAIL_DOMAIN');
        const fullEmail = email.includes('@') ? email : `${email}@${domain}`;
        const scriptPath = this.configService.get<string>('IREDMAIL_SCRIPT_PATH') || '/opt/iredmail/tools/create_mail_user_SQL.sh';

        // Command format depends on the script: create_mail_user_SQL.sh email password name quota
        // Example: bash /opt/iredmail/tools/create_mail_user_SQL.sh user@domain.com password "Name" 1024
        const command = `bash ${scriptPath} ${fullEmail} '${password}' '${name}' 1024`;

        try {
            console.log(`Creating iRedMail account: ${fullEmail}`);
            await this.executeSSH(command);
            return { success: true, email: fullEmail };
        } catch (error) {
            console.error('Failed to create iRedMail account:', error);
            throw error;
        }
    }

    async deleteAccount(email: string) {
        const domain = this.configService.get<string>('IREDMAIL_DOMAIN');
        const fullEmail = email.includes('@') ? email : `${email}@${domain}`;

        // Deleting usually involves a different script or direct SQL
        // Assuming a generic script for now or SQL command
        const command = `python3 /opt/iredmail/tools/delete_mail_user.py ${fullEmail}`; // Example

        try {
            await this.executeSSH(command);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete iRedMail account:', error);
            throw error;
        }
    }
}
