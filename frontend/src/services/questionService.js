import api from './api.js';

export const questionService = {
  // Test backend connection
  testConnection: async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await api.get('/questions/test');
      console.log('✅ Backend connection successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all questions with optional filters
  getAllQuestions: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = `/questions/public${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching from URL:', url); // Debug log
      const response = await api.get(url);
      console.log('✅ Response received:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching questions:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a single question by ID
  getQuestionById: async (id) => {
    try {
      const response = await api.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  },

  // Create a new question
  createQuestion: async (questionData) => {
    try {
      console.log('Posting questionData:', questionData); // <-- cek apakah ada questionnaireId
      const response = await api.post('/questions', questionData);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Update an existing question
  updateQuestion: async (id, questionData) => {
    try {
      const response = await api.put(`/questions/${id}`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Delete a question
  deleteQuestion: async (id) => {
    try {
      const response = await api.delete(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Get all question categories
  getCategories: async () => {
    try {
      const response = await api.get('/questions/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get question statistics
  getStats: async () => {
    try {
      const response = await api.get('/questions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};
