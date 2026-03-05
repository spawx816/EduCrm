import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface PortalContextType {
    student: any;
    login: any;
    logout: () => void;
    isAuthenticated: boolean;
}

const PortalContext = createContext<PortalContextType | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
    const [student, setStudent] = useState<any>(() => {
        const saved = localStorage.getItem('portal_student');
        return saved ? JSON.parse(saved) : null;
    });

    const login = useMutation({
        mutationFn: async (credentials: { matricula: string; email: string }) => {
            const { data } = await apiClient.post('/students/portal/login', credentials);
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('portal_student', JSON.stringify(data));
            setStudent(data);
        }
    });

    const logout = () => {
        localStorage.removeItem('portal_student');
        setStudent(null);
    };

    return (
        <PortalContext.Provider value={{ student, login, logout, isAuthenticated: !!student }}>
            {children}
        </PortalContext.Provider>
    );
}

export function usePortalAuth() {
    const context = useContext(PortalContext);
    if (!context) {
        throw new Error('usePortalAuth must be used within a PortalProvider');
    }
    return context;
}

export function usePortalData(studentId?: string) {
    const profile = useQuery({
        queryKey: ['portal', 'profile', studentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/portal/me/${studentId}`);
            return data;
        },
        enabled: !!studentId
    });

    const invoices = useQuery({
        queryKey: ['portal', 'invoices', studentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/portal/invoices/${studentId}`);
            return data;
        },
        enabled: !!studentId
    });

    const academic = useQuery({
        queryKey: ['portal', 'academic', studentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/portal/academic/${studentId}`);
            return data;
        },
        enabled: !!studentId
    });

    const attendance = useQuery({
        queryKey: ['portal', 'attendance', studentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/portal/attendance/${studentId}`);
            return data;
        },
        enabled: !!studentId
    });

    const grades = useQuery({
        queryKey: ['portal', 'grades', studentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/portal/grades/${studentId}`);
            return data;
        },
        enabled: !!studentId
    });

    return { profile, invoices, academic, attendance, grades };
}
