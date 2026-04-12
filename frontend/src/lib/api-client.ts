import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add a request interceptor to include the JWT token for admin routes only
apiClient.interceptors.request.use((config) => {
    // Determine if this is a student portal or public route
    // Bypass any route that has 'public-' in it, 'portal/' or 'portal-exams/'
    const isPublicRoute = config.url?.includes('public-') || 
                          config.url?.includes('portal/') ||
                          config.url?.includes('portal-exams/');
    
    // Only attach admin token if it's NOT a public route
    if (!isPublicRoute) {
        const token = localStorage.getItem('crm_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
            
            // Avoid redirecting if the user is in the Student Portal
            if (!window.location.pathname.includes('/portal')) {
                window.location.href = '/login';
            }
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
