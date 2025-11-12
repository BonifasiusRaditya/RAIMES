import api from './api';

export const questionnaireService = {
  // Test backend connection
  testConnection: async () => {
    try {
      console.log('🔍 Testing questionnaire backend connection...');
      const response = await api.get('/questionnaires/test');
      console.log('✅ Questionnaire backend connection successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Questionnaire backend connection failed:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all questionnaires
  getAllQuestionnaires: async () => {
    try {
      const response = await api.get('/questionnaires');
      return response.data;
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      throw error;
    }
  },

  // Get a single questionnaire by ID (with questions)
  getQuestionnaireById: async (id) => {
    try {
      const response = await api.get(`/questionnaires/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      throw error;
    }
  },

  // Create a new questionnaire
  createQuestionnaire: async (questionnaireData) => {
    try {
      console.log('Creating questionnaire:', questionnaireData);
      const response = await api.post('/questionnaires', questionnaireData);
      return response.data;
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      throw error;
    }
  },

  // Update an existing questionnaire
  updateQuestionnaire: async (id, questionnaireData) => {
    try {
      const response = await api.put(`/questionnaires/${id}`, questionnaireData);
      return response.data;
    } catch (error) {
      console.error('Error updating questionnaire:', error);
      throw error;
    }
  },

  // Delete a questionnaire
  deleteQuestionnaire: async (id) => {
    try {
      const response = await api.delete(`/questionnaires/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      throw error;
    }
  },

  // Get questionnaire statistics
  getStats: async () => {
    try {
      const response = await api.get('/questionnaires/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching questionnaire stats:', error);
      throw error;
    }
  }
};
