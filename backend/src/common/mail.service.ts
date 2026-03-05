import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<number>('SMTP_PORT') === 465, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendMail(to: string, subject: string, html: string, text?: string) {
        const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');
        try {
            const info = await this.transporter.sendMail({
                from: `"EduCRM" <${from}>`,
                to,
                subject,
                text: text || html.replace(/<[^>]*>?/gm, ''),
                html,
            });
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(to: string, name: string, credentials: { email: string; password?: string }) {
        const subject = 'Bienvenido a EduCRM - Tu cuenta de correo está lista';
        const html = `
      <h1>¡Hola, ${name}!</h1>
      <p>Bienvenido a nuestra plataforma. Tu cuenta de correo institucional ha sido creada correctamente.</p>
      <p><strong>Credenciales de acceso:</strong></p>
      <ul>
        <li><strong>Correo:</strong> ${credentials.email}</li>
        ${credentials.password ? `<li><strong>Contraseña temporal:</strong> ${credentials.password}</li>` : ''}
      </ul>
      <p>Puedes acceder a tu correo a través de nuestro portal webmail.</p>
      <br>
      <p>Atentamente,<br>El equipo de EduCRM</p>
    `;
        return this.sendMail(to, subject, html);
    }
}
