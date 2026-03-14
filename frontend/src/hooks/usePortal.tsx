import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { useState, createContext, useContext, useEffect, useCallback } from 'react';
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

    const logout = useCallback(() => {
        localStorage.removeItem('portal_student');
        setStudent(null);
    }, []);

    // Idle Timeout Logic (Auto-logout)
    useEffect(() => {
        if (!student) return; // Only track activity if logged in

        // 2 Hours (7200000 ms)
        const INACTIVITY_LIMIT_MS = 7200000;

        let timeoutId: number;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                console.log("Logged out from portal due to inactivity");
                logout();
            }, INACTIVITY_LIMIT_MS);
        };

        // Event listeners for user activity
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        const setupActivityListeners = () => {
            events.forEach(event => window.addEventListener(event, resetTimer));
            resetTimer(); // initialize the timer
        };

        const cleanupActivityListeners = () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            clearTimeout(timeoutId);
        };

        setupActivityListeners();

        return () => {
            cleanupActivityListeners();
        };
    }, [student, logout]);

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

    const exams = useQuery({
        queryKey: ['portal', 'exams', studentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/exams/student/${studentId}/attempts`);
            return data;
        },
        enabled: !!studentId
    });

    const diplomas = useQuery({
        queryKey: ['portal', 'diplomas', studentId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/diplomas/student/${studentId}`);
            return data;
        },
        enabled: !!studentId
    });

    return { profile, invoices, academic, attendance, grades, exams, diplomas };
}
