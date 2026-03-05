import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

interface AuthContextType {
    user: any;
    login: any;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(() => {
        const saved = localStorage.getItem('crm_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = useMutation({
        mutationFn: async (credentials: { email: string; password: string }) => {
            const { data } = await apiClient.post('/auth/login', credentials);
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('crm_user', JSON.stringify(data.user));
            localStorage.setItem('crm_token', data.access_token);
            setUser(data.user);
        }
    });

    const logout = () => {
        localStorage.removeItem('crm_user');
        localStorage.removeItem('crm_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
