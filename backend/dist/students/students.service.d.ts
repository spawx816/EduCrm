import { Pool } from 'pg';
import { StorageService } from '../common/storage.service';
import { MailService } from '../common/mail.service';
import { IRedMailService } from '../integrations/iredmail.service';
export declare class StudentsService {
    private readonly pool;
    private readonly storageService;
    private readonly mailService;
    private readonly iredMailService;
    constructor(pool: Pool, storageService: StorageService, mailService: MailService, iredMailService: IRedMailService);
    findAll(filters?: {
        search?: string;
        status?: string;
        sede_id?: string;
    }): Promise<any[]>;
    findOne(id: string): Promise<any>;
    convertLead(leadId: string): Promise<any>;
    create(data: {
        first_name: string;
        last_name: string;
        email: string;
        document_type: string;
        document_id: string;
        phone?: string;
        address?: string;
    }): Promise<any>;
    update(id: string, data: {
        first_name?: string;
        last_name?: string;
        email?: string;
        document_type?: string;
        document_id?: string;
        phone?: string;
        address?: string;
        status?: string;
        sede_id?: string;
        is_active?: boolean;
    }): Promise<any>;
    enroll(data: {
        studentId: string;
        cohortId: string;
        scholarshipId?: string;
        status?: string;
    }): Promise<any>;
    loginPortal(matricula: string, email: string): Promise<any>;
    getPortalInvoices(studentId: string): Promise<any[]>;
    getPortalAcademic(studentId: string): Promise<any[]>;
    getPortalAttendance(studentId: string): Promise<any[]>;
    getPortalGrades(studentId: string): Promise<any[]>;
    getFullHistory(studentId: string): Promise<any[]>;
    getAttachments(studentId: string): Promise<any[]>;
    uploadAttachment(studentId: string, file: any): Promise<any>;
    deleteAttachment(id: string): Promise<any>;
    uploadAvatar(studentId: string, file: any): Promise<any>;
    deleteEnrollment(id: string): Promise<any>;
}
