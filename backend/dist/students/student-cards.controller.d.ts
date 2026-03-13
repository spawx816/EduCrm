import { StudentCardsService } from './student-cards.service';
export declare class StudentCardsController {
    private readonly studentCardsService;
    constructor(studentCardsService: StudentCardsService);
    findAll(): Promise<any[]>;
    findByStudent(studentId: string): Promise<any[]>;
    generate(data: {
        studentId: string;
    }): Promise<any>;
    updateStatus(id: string, data: {
        status: string;
    }): Promise<any>;
}
