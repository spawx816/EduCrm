import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token (to be implemented)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('crm_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle 401 Unauthorized globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('crm_token');
            localStorage.removeItem('crm_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getStaticUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

export default apiClient;
