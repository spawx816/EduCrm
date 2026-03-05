import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

export const useInstructorCohorts = (teacherId?: string) => {
    return useQuery({
        queryKey: ['instructor-cohorts', teacherId],
        queryFn: async () => {
            const res = await apiClient.get(`/academic/instructor/cohorts/${teacherId}`);
            return res.data;
        },
        enabled: !!teacherId
    });
};

export const useInstructorModules = (cohortId?: string, teacherId?: string) => {
    return useQuery({
        queryKey: ['instructor-modules', cohortId, teacherId],
        queryFn: async () => {
            const res = await apiClient.get(`/academic/instructor/cohorts/${cohortId}/modules/${teacherId}`);
            return res.data;
        },
        enabled: !!cohortId && !!teacherId
    });
};
