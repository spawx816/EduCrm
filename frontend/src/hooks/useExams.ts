import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

export function useModuleExams(moduleId?: string) {
    return useQuery({
        queryKey: ['exams', 'module', moduleId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/exams/module/${moduleId}`);
            return data;
        },
        enabled: !!moduleId,
    });
}

export function useExamDetail(examId?: string) {
    return useQuery({
        queryKey: ['exams', 'detail', examId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/exams/${examId}`);
            return data;
        },
        enabled: !!examId,
    });
}

export function useExamAttemptDetail(attemptId?: string) {
    return useQuery({
        queryKey: ['exams', 'attempt-detail', attemptId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/exams/attempts/${attemptId}/detail`);
            return data;
        },
        enabled: !!attemptId,
    });
}

export function useCreateExam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: res } = await apiClient.post('/exams', data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams'] });
        },
    });
}

export function useUpdateExam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: res } = await apiClient.put(`/exams/${id}`, data);
            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exams'] });
            queryClient.invalidateQueries({ queryKey: ['exams', 'detail', variables.id] });
        },
    });
}

export function useAddQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ examId, data }: { examId: string; data: any }) => {
            const { data: res } = await apiClient.post(`/exams/${examId}/questions`, data);
            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exams', 'detail', variables.examId] });
        },
    });
}

export function useUpdateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; examId: string; data: any }) => {
            const { data: res } = await apiClient.put(`/exams/questions/${id}`, data);
            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exams', 'detail', variables.examId] });
        },
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: string; examId: string }) => {
            const { data: res } = await apiClient.delete(`/exams/questions/${id}`);
            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exams', 'detail', variables.examId] });
        },
    });
}

export function useAssignExam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { exam_id: string; cohort_id: string; module_id: string; start_date: string; end_date: string }) => {
            const res = await apiClient.post('/exams/assign', data);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exams', 'cohort', variables.cohort_id] });
        }
    });
}

export function useCohortExamAssignments(cohortId?: string) {
    return useQuery({
        queryKey: ['exams', 'cohort', cohortId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/exams/cohort/${cohortId}/assignments`);
            return data;
        },
        enabled: !!cohortId,
    });
}

export function useStartAttempt() {
    return useMutation({
        mutationFn: async (data: { studentId: string; assignmentId: string }) => {
            const res = await apiClient.post('/exams/attempts/start', data);
            return res.data;
        }
    });
}

export function useSubmitAttempt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ attemptId, answers }: { attemptId: string; answers: any[] }) => {
            const res = await apiClient.post(`/exams/attempts/${attemptId}/submit`, { answers });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams', 'attempts'] });
        }
    });
}

export function useStudentAttempts(studentId?: string) {
    return useQuery({
        queryKey: ['exams', 'attempts', 'student', studentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/exams/student/${studentId}/attempts`);
            return data;
        },
        enabled: !!studentId,
    });
}

export function useAssignmentResults(assignmentId?: string) {
    return useQuery({
        queryKey: ['exams', 'assignment-results', assignmentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/exams/assignments/${assignmentId}/results`);
            return data;
        },
        enabled: !!assignmentId,
    });
}
