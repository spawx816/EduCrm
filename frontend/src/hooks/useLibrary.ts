import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

export function useLibraryResources(studentId?: string) {
  return useQuery({
    queryKey: ['library_resources', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get('/library', { params: { studentId } });
      return data;
    },
  });
}

export function useCreateLibraryResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/library', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library_resources'] });
    }
  });
}

export function useUpdateLibraryResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiClient.put(`/library/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library_resources'] });
    }
  });
}

export function useDeleteLibraryResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/library/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library_resources'] });
    }
  });
}

export function useLibraryPermissions(resourceId: string) {
  return useQuery({
    queryKey: ['library_permissions', resourceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/library/${resourceId}/permissions`);
      return data;
    },
    enabled: !!resourceId
  });
}

export function useAddLibraryPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ resourceId, programId }: { resourceId: string; programId: string }) => {
      const res = await apiClient.post(`/library/${resourceId}/permissions`, { programId });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['library_permissions', variables.resourceId] });
    }
  });
}

export function useRemoveLibraryPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ resourceId, programId }: { resourceId: string; programId: string }) => {
      const res = await apiClient.delete(`/library/${resourceId}/permissions/${programId}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['library_permissions', variables.resourceId] });
    }
  });
}
