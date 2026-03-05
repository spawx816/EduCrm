import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client.ts';

export function useApiKeys() {
    return useQuery({
        queryKey: ['apiKeys'],
        queryFn: async () => {
            const res = await apiClient.get('/integrations/keys');
            return res.data;
        }
    });
}

export function useCreateApiKey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; serviceName?: string }) => {
            const res = await apiClient.post('/integrations/keys', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
        }
    });
}

export function useRevokeApiKey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/integrations/keys/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
        }
    });
}
