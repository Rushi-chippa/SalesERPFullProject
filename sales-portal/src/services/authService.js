import api from './api';

export const authService = {
    login: async (email, password) => {
        return api.post('/auth/login', { email, password });
    },

    register: async (data) => {
        // data can be JSON object or FormData
        return api.post('/auth/register', data);
    },

    registerSalesman: async (data) => {
        return api.post('/auth/register-salesman', data);
    },

    getCompanies: async () => {
        return api.get('/auth/companies');
    },

    getProfile: async () => {
        return api.get('/auth/profile');
    },

    updateProfile: async (data) => {
        return api.put('/auth/profile', data);
    },

    changePassword: async (currentPassword, newPassword) => {
        return api.put('/auth/change-password', { currentPassword, newPassword });
    },
};