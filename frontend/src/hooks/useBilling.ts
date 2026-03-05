import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client.ts';

export function useInvoices(filters: { studentId?: string; search?: string; status?: string; startDate?: string; endDate?: string } = {}) {
    return useQuery({
        queryKey: ['invoices', filters],
        queryFn: async () => {
            const res = await apiClient.get('/billing/invoices', {
                params: filters
            });
            return res.data;
        }
    });
}

export function useScholarships() {
    return useQuery({
        queryKey: ['scholarships'],
        queryFn: async () => {
            const res = await apiClient.get('/billing/scholarships');
            return res.data;
        }
    });
}

export function useBillingItems() {
    return useQuery({
        queryKey: ['billingItems'],
        queryFn: async () => {
            const res = await apiClient.get('/billing/items');
            return res.data;
        }
    });
}

export function useCreateScholarship() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; description?: string; type: 'PERCENTAGE' | 'FIXED'; value: number }) => {
            const res = await apiClient.post('/billing/scholarships', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
        },
    });
}

export function useCreateBillingItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            name: string;
            description?: string;
            price: number;
            is_inventory?: boolean;
            stock_quantity?: number;
            min_stock?: number;
        }) => {
            const res = await apiClient.post('/billing/items', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billingItems'] });
        },
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.post('/billing/invoices', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
}

export function useRegisterPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.post('/billing/payments', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
}

export function useInstructorPayments(teacherId?: string) {
    return useQuery({
        queryKey: ['instructorPayments', { teacherId }],
        queryFn: async () => {
            const res = await apiClient.get('/billing/instructor-payments', {
                params: { teacherId }
            });
            return res.data;
        }
    });
}

export function useRegisterInstructorPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.post('/billing/instructor-payments', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instructorPayments'] });
        },
    });
}

export function useInvoiceSuggestions(studentId?: string) {
    return useQuery({
        queryKey: ['invoiceSuggestions', studentId],
        queryFn: async () => {
            const res = await apiClient.get(`/billing/suggestions/${studentId}`);
            return res.data;
        },
        enabled: !!studentId
    });
}
export function useVoidInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.post(`/billing/invoices/${id}/void`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
}

export function useInventoryMovements(itemId?: string) {
    return useQuery({
        queryKey: ['inventoryMovements', itemId],
        queryFn: async () => {
            const res = await apiClient.get('/billing/inventory/movements', {
                params: { itemId }
            });
            return res.data;
        }
    });
}

export function useAdjustStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { itemId: string; quantity: number; type: 'IN' | 'OUT'; notes?: string }) => {
            const res = await apiClient.post('/billing/inventory/adjust', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billingItems'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryMovements'] });
        },
    });
}

// Expense Management Hooks
export function useExpenseCategories() {
    return useQuery({
        queryKey: ['expenseCategories'],
        queryFn: async () => {
            const res = await apiClient.get('/billing/expenses/categories');
            return res.data;
        }
    });
}

export function useExpenses(filters: { categoryId?: string; startDate?: string; endDate?: string } = {}) {
    return useQuery({
        queryKey: ['expenses', filters],
        queryFn: async () => {
            const res = await apiClient.get('/billing/expenses', {
                params: filters
            });
            return res.data;
        }
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.post('/billing/expenses', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/billing/expenses/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });
}
