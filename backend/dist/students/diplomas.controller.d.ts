import { DiplomasService } from './diplomas.service';
export declare class DiplomasController {
    private readonly diplomasService;
    constructor(diplomasService: DiplomasService);
    getAll(): Promise<any[]>;
    getByStudent(studentId: string): Promise<any[]>;
    downloadPdf(id: string, res: any): Promise<void>;
}
