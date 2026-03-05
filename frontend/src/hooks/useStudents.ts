import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { Student } from '../types/index.ts';

export function useStudents(filters?: { search?: string; status?: string; sede_id?: string }) {
    return useQuery<Student[]>({
        queryKey: ['students', filters],
        queryFn: async () => {
            const { data } = await apiClient.get('/students', { params: filters });
            return data;
        },
    });
}

export function useStudent(id?: string) {
    return useQuery<Student>({
        queryKey: ['students', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: res } = await apiClient.post('/students', data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

export function useConvertLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (leadId: string) => {
            const { data } = await apiClient.post(`/students/convert/${leadId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

export function useEnrollStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { studentId: string; cohortId: string; scholarshipId?: string }) => {
            const { data: res } = await apiClient.post('/students/enroll', data);
            return res;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
        },
    });
}

export function useStudentHistory(studentId?: string) {
    return useQuery<any[]>({
        queryKey: ['students', studentId, 'history'],
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/${studentId}/full-history`);
            return data;
        },
        enabled: !!studentId,
    });
}

export function useStudentAttachments(studentId?: string) {
    return useQuery<any[]>({
        queryKey: ['students', studentId, 'attachments'],
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/${studentId}/attachments`);
            return data;
        },
        enabled: !!studentId,
    });
}

export function useUploadStudentAttachment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ studentId, file }: { studentId: string; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await apiClient.post(`/students/${studentId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['students', variables.studentId, 'attachments'] });
        },
    });
}

export function useDeleteStudentAttachment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ attachmentId }: { studentId: string; attachmentId: string }) => {
            const { data } = await apiClient.delete(`/students/attachments/${attachmentId}`);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['students', variables.studentId, 'attachments'] });
        },
    });
}

export function useUploadStudentAvatar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ studentId, file }: { studentId: string; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await apiClient.post(`/students/${studentId}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        },
        onSuccess: (_, variables) => {
            // Invalidar la caché del estudiante para que se recargue con el nuevo avatar_url
            queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}
