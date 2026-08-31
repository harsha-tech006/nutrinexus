import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth services
export const authService = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
};

// Hospital Emergency Locator services
export const hospitalService = {
    getHospitals: (params) => api.get('/hospitals', { params }),
    getHospitalDetail: (id) => api.get(`/hospitals/${id}`),
};

// Doctor Consultation & Video services
export const doctorService = {
    getVideos: (params) => api.get('/doctors/videos', { params }),
    getLiveSessions: () => api.get('/doctors/live-sessions'),
    bookConsultation: (data) => api.post('/doctors/book-consultation', data),
};

// Women's Health & Pregnancy services
export const womenHealthService = {
    getCycleStatus: () => api.get('/women-health/cycle-status'),
    updateCycleSettings: (data) => api.post('/women-health/cycle-settings', data),
    logSymptoms: (data) => api.post('/women-health/log-symptoms', data),
    getPregnancyNutrition: () => api.get('/women-health/pregnancy-nutrition'),
    updatePregnancyProfile: (data) => api.post('/women-health/pregnancy-profile', data),
};

// Health Condition Monitoring & Smart Alert services
export const healthConditionService = {
    getHealthStatus: (params) => api.get('/health/status', { params }),
    getHealthProgress: (params) => api.get('/health/progress', { params }),
    getDiseaseProgress: (params) => api.get('/health/disease-progress', { params }),
    postMeasurement: (data) => api.post('/health/measurements', data),
    getAIInsight: () => api.get('/health/ai-insight'),
    getNotifications: () => api.get('/health/notifications'),
    markNotificationRead: (data) => api.post('/health/notifications/mark-read', data),
};

export default api;