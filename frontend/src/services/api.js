import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careermatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized / expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('careermatch_token');
        localStorage.removeItem('careermatch_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session_expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const studentsApi = {
  getMyProfile: () => api.get('/students/me'),
  updateMyProfile: (data) => api.put('/students/me', data),
  getCompleteness: () => api.get('/students/me/completeness'),
  parseResume: (resume_text) => api.post('/students/me/parse-resume', { resume_text }),
};

export const opportunitiesApi = {
  list: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
};

export const recommendationsApi = {
  getRecommendations: (params, customWeights) => {
    if (customWeights) {
      return api.post('/recommendations/generate', { weights: customWeights }, { params });
    }
    return api.get('/recommendations', { params });
  },
  getExplanation: (id) => api.get(`/recommendations/${id}/explanation`),
};

export const skillGapsApi = {
  analyze: (opportunity_id) => api.post('/skill-gaps/analyze', { opportunity_id }),
};

export const savedOpportunitiesApi = {
  list: () => api.get('/saved-opportunities'),
  save: (id) => api.post(`/saved-opportunities/${id}`),
  unsave: (id) => api.delete(`/saved-opportunities/${id}`),
};

export const applicationsApi = {
  list: (params) => api.get('/applications', { params }),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.patch(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

export const analyticsApi = {
  getStudentDashboard: () => api.get('/analytics/student-dashboard'),
  getAdminDashboard: () => api.get('/analytics/admin-dashboard'),
};

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getStudents: () => api.get('/admin/students'),
  getApplications: () => api.get('/admin/applications'),
};

export const assistantApi = {
  chat: (query) => api.post('/assistant/chat', { query }),
};

export default api;
