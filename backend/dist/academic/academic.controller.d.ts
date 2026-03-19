import { AcademicService } from './academic.service';
export declare class AcademicController {
    private readonly academicService;
    constructor(academicService: AcademicService);
    findAllSedes(): Promise<any[]>;
    findAllPrograms(): Promise<any[]>;
    findProgramById(id: string): Promise<any>;
    createProgram(data: any): Promise<any>;
    updateProgram(id: string, data: any): Promise<any>;
    deleteProgram(id: string): Promise<any>;
    findModulesByProgram(programId: string): Promise<any[]>;
    createModule(data: any): Promise<any>;
    updateModule(id: string, data: any): Promise<any>;
    deleteModule(id: string): Promise<any>;
    getModuleAddons(id: string): Promise<any[]>;
    addModuleAddon(id: string, itemId: string): Promise<any>;
    removeModuleAddon(id: string, itemId: string): Promise<{
        success: boolean;
    }>;
    findAllCohorts(programId?: string): Promise<any[]>;
    createCohort(data: any): Promise<any>;
    updateCohort(id: string, data: any): Promise<any>;
    deleteCohort(id: string): Promise<any>;
    getCohortModules(cohortId: string): Promise<any[]>;
    assignInstructor(data: any): Promise<any>;
    findInstructors(): Promise<any[]>;
    registerAttendance(data: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getCohortAttendance(cohortId: string, moduleId?: string, date?: string): Promise<any[]>;
    findGradeTypes(programId: string, moduleId?: string, studentId?: string): Promise<any[]>;
    createGradeType(data: any): Promise<any>;
    registerGrades(data: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getCohortGrades(cohortId: string, moduleId?: string): Promise<any[]>;
    getCohortStudents(cohortId: string): Promise<any[]>;
    getInstructorCohorts(teacherId: string): Promise<any[]>;
    getInstructorModules(cohortId: string, teacherId: string): Promise<any[]>;
}
