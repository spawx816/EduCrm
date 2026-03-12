import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

export function useStudentDiplomas(studentId: string) {
    return useQuery({
        queryKey: ['diplomas', studentId],
        queryFn: async () => {
            const res = await apiClient.get(`/students/diplomas/student/${studentId}`);
            return res.data;
        },
        enabled: !!studentId,
    });
}

export function useAllDiplomas() {
    return useQuery({
        queryKey: ['diplomas'],
        queryFn: async () => {
            const res = await apiClient.get('/students/diplomas');
            return res.data;
        },
    });
}
