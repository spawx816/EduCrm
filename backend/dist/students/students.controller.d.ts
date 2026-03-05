import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(search?: string, status?: string, sede_id?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(data: any): Promise<any>;
    convertLead(leadId: string): Promise<any>;
    enroll(data: any): Promise<any>;
    getFullHistory(id: string): Promise<any[]>;
    portalLogin(data: {
        matricula: string;
        email: string;
    }): Promise<any>;
    getPortalProfile(id: string): Promise<any>;
    getPortalInvoices(studentId: string): Promise<any[]>;
    getPortalAcademic(studentId: string): Promise<any[]>;
    getPortalAttendance(studentId: string): Promise<any[]>;
    getPortalGrades(studentId: string): Promise<any[]>;
    getAttachments(id: string): Promise<any[]>;
    uploadAttachment(id: string, file: any): Promise<any>;
    deleteAttachment(id: string): Promise<any>;
    uploadAvatar(id: string, file: any): Promise<any>;
}
