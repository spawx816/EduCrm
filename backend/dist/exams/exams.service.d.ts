import { Pool } from 'pg';
export declare class ExamsService {
    private pool;
    constructor(pool: Pool);
    getAllExams(): Promise<any[]>;
    createExam(data: {
        module_id: string;
        title: string;
        description?: string;
        time_limit_minutes?: number;
        passing_score?: number;
        created_by: string;
    }): Promise<any>;
    getModuleExams(moduleId: string): Promise<any[]>;
    getExamDetail(examId: string): Promise<any>;
    getAttemptDetail(attemptId: string): Promise<any>;
    getAssignmentResults(assignmentId: string): Promise<any[]>;
    addQuestion(examId: string, data: {
        text: string;
        type: string;
        points?: number;
        order_index?: number;
        image_url?: string;
        options?: any[];
    }): Promise<any>;
    updateExam(examId: string, data: {
        title?: string;
        description?: string;
        time_limit_minutes?: number;
        passing_score?: number;
    }): Promise<any>;
    updateQuestion(questionId: string, data: {
        text?: string;
        type?: string;
        points?: number;
        image_url?: string;
        options?: any[];
    }): Promise<any>;
    deleteExam(examId: string): Promise<{
        success: boolean;
    }>;
    deleteQuestion(questionId: string): Promise<{
        success: boolean;
    }>;
    assignExam(data: {
        exam_id: string;
        cohort_id: string;
        module_id: string;
        start_date?: string;
        end_date?: string;
    }): Promise<any>;
    updateAssignmentSchedule(id: string, start_date: string, end_date: string): Promise<any>;
    getAllAssignments(): Promise<any[]>;
    getCohortAssignments(cohortId: string): Promise<any[]>;
    startAttempt(studentId: string, assignmentId: string): Promise<any>;
    submitAttempt(attemptId: string, answers: {
        question_id: string;
        option_id?: string;
        text_answer?: string;
    }[]): Promise<any>;
    getStudentAttempts(studentId: string): Promise<any[]>;
}
