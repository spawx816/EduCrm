import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { AcademicProgram, Cohort, Sede } from '../types/index.ts';

export function useSedes() {
    return useQuery<Sede[]>({
        queryKey: ['sedes'],
        queryFn: async () => {
            const { data } = await apiClient.get('/academic/sedes');
            return data;
        },
    });
}

export function usePrograms() {
    return useQuery<AcademicProgram[]>({
        queryKey: ['programs'],
        queryFn: async () => {
            const { data } = await apiClient.get('/academic/programs');
            return data;
        },
    });
}

export function useCreateProgram() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<AcademicProgram>) => {
            const res = await apiClient.post('/academic/programs', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        }
    });
}

export function useUpdateProgram() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: Partial<AcademicProgram> & { id: string }) => {
            const res = await apiClient.patch(`/academic/programs/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        }
    });
}

export function useDeleteProgram() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/academic/programs/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        }
    });
}

export function useCohorts(programId?: string) {
    return useQuery<Cohort[]>({
        queryKey: ['cohorts', { programId }],
        queryFn: async () => {
            const { data } = await apiClient.get('/academic/cohorts', {
                params: { programId },
            });
            return data;
        },
    });
}

export function useCreateCohort() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Cohort>) => {
            const res = await apiClient.post('/academic/cohorts', data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cohorts'] });
            if (variables.program_id) {
                queryClient.invalidateQueries({ queryKey: ['cohorts', { programId: variables.program_id }] });
            }
        }
    });
}

export function useUpdateCohort() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: Partial<Cohort> & { id: string }) => {
            const res = await apiClient.patch(`/academic/cohorts/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cohorts'] });
        }
    });
}

export function useDeleteCohort() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/academic/cohorts/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cohorts'] });
        }
    });
}

// --- Modules ---

export const useModules = (programId?: string) => {
    return useQuery({
        queryKey: ['modules', programId],
        queryFn: async () => {
            const res = await apiClient.get(`/academic/programs/${programId}/modules`);
            return res.data;
        },
        enabled: !!programId
    });
};

export const useCreateModule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { program_id: string; name: string; description?: string; order_index?: number; price?: number }) => {
            const res = await apiClient.post('/academic/modules', data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['modules', variables.program_id] });
        }
    });
};

export const useUpdateModule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; order_index?: number; price?: number }) => {
            const res = await apiClient.patch(`/academic/modules/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        }
    });
};

export const useDeleteModule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/academic/modules/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        }
    });
};

// --- Module Addons ---

export const useModuleAddons = (moduleId?: string) => {
    return useQuery({
        queryKey: ['module-addons', moduleId],
        queryFn: async () => {
            const res = await apiClient.get(`/academic/modules/${moduleId}/addons`);
            return res.data;
        },
        enabled: !!moduleId
    });
};

export const useAddModuleAddon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ moduleId, itemId }: { moduleId: string; itemId: string }) => {
            const res = await apiClient.post(`/academic/modules/${moduleId}/addons`, { itemId });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['module-addons', variables.moduleId] });
        }
    });
};

export const useRemoveModuleAddon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ moduleId, itemId }: { moduleId: string; itemId: string }) => {
            const res = await apiClient.delete(`/academic/modules/${moduleId}/addons/${itemId}`);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['module-addons', variables.moduleId] });
        }
    });
};

// --- Cohort Modules & Instructors ---

export const useCohortModules = (cohortId?: string) => {
    return useQuery({
        queryKey: ['cohort-modules', cohortId],
        queryFn: async () => {
            const res = await apiClient.get(`/academic/cohorts/${cohortId}/modules`);
            return res.data;
        },
        enabled: !!cohortId
    });
};

export const useAssignInstructor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { cohort_id: string; module_id: string; teacher_id: string; start_date?: string; end_date?: string }) => {
            const res = await apiClient.post('/academic/cohorts/assign-instructor', data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cohort-modules', variables.cohort_id] });
        }
    });
};

export const useInstructors = () => {
    return useQuery({
        queryKey: ['instructors'],
        queryFn: async () => {
            const res = await apiClient.get('/academic/instructors');
            return res.data;
        }
    });
};

// --- Attendance ---

export const useAttendance = (cohortId?: string, moduleId?: string, date?: string) => {
    return useQuery({
        queryKey: ['attendance', cohortId, moduleId, date],
        queryFn: async () => {
            const res = await apiClient.get(`/academic/attendance/${cohortId}`, {
                params: { moduleId, date }
            });
            return res.data;
        },
        enabled: !!cohortId && !!moduleId
    });
};

export const useRegisterAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { cohort_id: string; module_id: string; date: string; records: any[] }) => {
            const res = await apiClient.post('/academic/attendance', data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['attendance', variables.cohort_id, variables.module_id] });
        }
    });
};

// --- Grades ---

export const useGradeTypes = (programId?: string, moduleId?: string) => {
    return useQuery({
        queryKey: ['grade-types', programId, moduleId],
        queryFn: async () => {
            const res = await apiClient.get(`/academic/grade-types/${programId}`, {
                params: { moduleId }
            });
            return res.data;
        },
        enabled: !!programId
    });
};

export const useCreateGradeType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { program_id: string; module_id: string; name: string; weight?: number }) => {
            const res = await apiClient.post('/academic/grade-types', data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grade-types', variables.program_id, variables.module_id] });
        }
    });
};

export const useGrades = (cohortId?: string, moduleId?: string) => {
    return useQuery({
        queryKey: ['grades', cohortId, moduleId],
        queryFn: async () => {
            const res = await apiClient.get(`/academic/grades/${cohortId}`, {
                params: { moduleId }
            });
            return res.data;
        },
        enabled: !!cohortId && !!moduleId
    });
};

export const useRegisterGrades = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { cohort_id: string; module_id: string; grade_type_id: string; records: any[] }) => {
            const res = await apiClient.post('/academic/grades', data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['grades', variables.cohort_id, variables.module_id] });
        }
    });
};

export function useCohortStudents(cohortId: string) {
    return useQuery({
        queryKey: ['cohort-students', cohortId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/academic/cohorts/${cohortId}/students`);
            return data;
        },
        enabled: !!cohortId,
    });
}

export function useProgram(id?: string) {
    return useQuery<AcademicProgram>({
        queryKey: ['programs', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/academic/programs/${id}`);
            return data;
        },
        enabled: !!id
    });
}
