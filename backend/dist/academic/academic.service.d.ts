import { Pool } from 'pg';
export declare class AcademicService {
    private readonly pool;
    constructor(pool: Pool);
    findAllSedes(): Promise<any[]>;
    findAllPrograms(): Promise<any[]>;
    findProgramById(id: string): Promise<any>;
    createProgram(data: {
        name: string;
        description?: string;
        code?: string;
        enrollment_price?: number;
        billing_day?: number;
    }): Promise<any>;
    updateProgram(id: string, data: {
        name?: string;
        description?: string;
        code?: string;
        is_active?: boolean;
        enrollment_price?: number;
        billing_day?: number;
    }): Promise<any>;
    deleteProgram(id: string): Promise<any>;
    findAllCohorts(programId?: string): Promise<any[]>;
    createCohort(data: {
        program_id: string;
        name: string;
        start_date: Date | string;
        end_date?: Date | string;
    }): Promise<any>;
    updateCohort(id: string, data: {
        name?: string;
        start_date?: Date | string;
        end_date?: Date | string;
        is_active?: boolean;
    }): Promise<any>;
    deleteCohort(id: string): Promise<any>;
    findModulesByProgram(programId: string): Promise<any[]>;
    createModule(data: {
        program_id: string;
        name: string;
        description?: string;
        order_index?: number;
        price?: number;
    }): Promise<any>;
    updateModule(id: string, data: {
        name?: string;
        description?: string;
        order_index?: number;
        price?: number;
    }): Promise<any>;
    deleteModule(id: string): Promise<any>;
    addModuleAddon(moduleId: string, itemId: string): Promise<any>;
    removeModuleAddon(moduleId: string, itemId: string): Promise<{
        success: boolean;
    }>;
    getModuleAddons(moduleId: string): Promise<any[]>;
    assignInstructorToModule(data: {
        cohort_id: string;
        module_id: string;
        teacher_id: string;
        start_date?: Date | string;
        end_date?: Date | string;
    }): Promise<any>;
    getCohortModules(cohortId: string): Promise<any[]>;
    registerAttendance(data: {
        cohort_id: string;
        module_id: string;
        date: string;
        records: {
            student_id: string;
            status: string;
            remarks?: string;
        }[];
    }): Promise<{
        success: boolean;
        count: number;
    }>;
    getCohortAttendance(cohortId: string, module_id?: string, date?: string): Promise<any[]>;
    findGradeTypes(programId: string, module_id?: string): Promise<any[]>;
    createGradeType(data: {
        program_id: string;
        module_id?: string;
        name: string;
        weight?: number;
    }): Promise<any>;
    registerGrades(data: {
        cohort_id: string;
        module_id: string;
        grade_type_id: string;
        records: {
            student_id: string;
            value: number;
            remarks?: string;
        }[];
    }): Promise<{
        success: boolean;
        count: number;
    }>;
    getCohortGrades(cohortId: string, module_id?: string): Promise<any[]>;
    findInstructors(): Promise<any[]>;
    getInstructorCohorts(teacherId: string): Promise<any[]>;
    getInstructorModules(teacherId: string, cohortId: string): Promise<any[]>;
    getCohortStudents(cohortId: string): Promise<any[]>;
}
