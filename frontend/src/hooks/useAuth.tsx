import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

interface AuthContextType {
    user: any;
    login: any;
    logout: () => void;
    updateProfile: any;
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

    const logout = useCallback(() => {
        localStorage.removeItem('crm_user');
        localStorage.removeItem('crm_token');
        setUser(null);
    }, []);

    // Idle Timeout Logic (Auto-logout)
    useEffect(() => {
        if (!user) return; // Only track activity if logged in

        // 2 Hours (7200000 ms)
        const INACTIVITY_LIMIT_MS = 7200000;

        let timeoutId: number;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                console.log("Logged out due to inactivity");
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
    }, [user, logout]);

    const updateProfile = useMutation({
        mutationFn: async (data: any) => {
            const { data: updated } = await apiClient.patch('/auth/profile', data);
            return updated;
        },
        onSuccess: (updatedUser) => {
            // Update local user state but preserve anything not returned by PATCH
            const newUser = { ...user, ...updatedUser };
            localStorage.setItem('crm_user', JSON.stringify(newUser));
            setUser(newUser);
        }
    });

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile, isAuthenticated: !!user }}>
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
