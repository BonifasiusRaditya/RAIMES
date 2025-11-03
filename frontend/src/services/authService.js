import api from './api';

const authService = {
    // Login user
    login: async (username, password) => {
        try {
            const response = await api.post('/auth/login', {
                username,
                password,
            });
            
            if (response.data.success) {
                // Save token and user data to localStorage
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                return response.data;
            }
            
            throw new Error(response.data.message || 'Login failed');
        } catch (error) {
            // Extract error message from API response
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Network error. Please check your connection.';
            throw errorMessage;
        }
    },

    // Register new user
    register: async (username, email, password, role = 'user') => {
        try {
            const response = await api.post('/auth/register', {
                username,
                email,
                password,
                role,
            });
            
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Get stored user data
    getUser: () => {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    },

    // Get token
    getToken: () => {
        return localStorage.getItem('token');
    },
};

export default authService;
