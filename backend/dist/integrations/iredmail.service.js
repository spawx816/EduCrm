"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IRedMailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ssh2_1 = require("ssh2");
let IRedMailService = class IRedMailService {
    constructor(configService) {
        this.configService = configService;
    }
    async executeSSH(command) {
        const conn = new ssh2_1.Client();
        return new Promise((resolve, reject) => {
            conn
                .on('ready', () => {
                conn.exec(command, (err, stream) => {
                    if (err)
                        return reject(err);
                    let output = '';
                    stream
                        .on('close', (code, signal) => {
                        conn.end();
                        if (code !== 0) {
                            reject(new Error(`Exit code: ${code}, signal: ${signal}`));
                        }
                        else {
                            resolve(output);
                        }
                    })
                        .on('data', (data) => {
                        output += data;
                    })
                        .stderr.on('data', (data) => {
                        console.error('SSH STDERR:', data.toString());
                    });
                });
            })
                .on('error', (err) => reject(err))
                .connect({
                host: this.configService.get('IREDMAIL_SSH_HOST'),
                port: this.configService.get('IREDMAIL_SSH_PORT') || 22,
                username: this.configService.get('IREDMAIL_SSH_USER'),
                password: this.configService.get('IREDMAIL_SSH_PASS'),
                privateKey: this.configService.get('IREDMAIL_SSH_KEY'),
            });
        });
    }
    async createAccount(email, password, name) {
        const domain = this.configService.get('IREDMAIL_DOMAIN');
        const fullEmail = email.includes('@') ? email : `${email}@${domain}`;
        const scriptPath = this.configService.get('IREDMAIL_SCRIPT_PATH') || '/opt/iredmail/tools/create_mail_user_SQL.sh';
        const command = `bash ${scriptPath} ${fullEmail} '${password}' '${name}' 1024`;
        try {
            console.log(`Creating iRedMail account: ${fullEmail}`);
            await this.executeSSH(command);
            return { success: true, email: fullEmail };
        }
        catch (error) {
            console.error('Failed to create iRedMail account:', error);
            throw error;
        }
    }
    async deleteAccount(email) {
        const domain = this.configService.get('IREDMAIL_DOMAIN');
        const fullEmail = email.includes('@') ? email : `${email}@${domain}`;
        const command = `python3 /opt/iredmail/tools/delete_mail_user.py ${fullEmail}`;
        try {
            await this.executeSSH(command);
            return { success: true };
        }
        catch (error) {
            console.error('Failed to delete iRedMail account:', error);
            throw error;
        }
    }
};
exports.IRedMailService = IRedMailService;
exports.IRedMailService = IRedMailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IRedMailService);
//# sourceMappingURL=iredmail.service.js.map