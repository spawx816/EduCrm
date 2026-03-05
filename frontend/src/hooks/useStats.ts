import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const res = await apiClient.get('/stats/dashboard');
            return res.data;
        }
    });
}
