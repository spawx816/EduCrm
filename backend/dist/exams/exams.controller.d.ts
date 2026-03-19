import { ExamsService } from './exams.service';
export declare class ExamsController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    createExam(data: any, req: any): Promise<any>;
    getModuleExams(moduleId: string): Promise<any[]>;
    getExamDetail(id: string): Promise<any>;
    getAttemptDetail(attemptId: string): Promise<any>;
    addQuestion(id: string, data: any): Promise<any>;
    updateExam(id: string, data: any): Promise<any>;
    deleteExam(id: string): Promise<{
        success: boolean;
    }>;
    updateQuestion(id: string, data: any): Promise<any>;
    deleteQuestion(id: string): Promise<{
        success: boolean;
    }>;
    assignExam(data: any): Promise<any>;
    updateAssignmentSchedule(id: string, data: {
        start_date: string;
        end_date: string;
    }): Promise<any>;
    getCohortAssignments(cohortId: string): Promise<any[]>;
    getAssignmentResults(assignmentId: string): Promise<any[]>;
    startAttempt(data: {
        studentId: string;
        assignmentId: string;
    }): Promise<any>;
    submitAttempt(attemptId: string, data: {
        answers: any[];
    }): Promise<any>;
    getStudentAttempts(studentId: string): Promise<any[]>;
}
