import api from './api';

export const assessmentService = {
  // Get all assessments for current user/company
  getMyAssessments: async () => {
    try {
      const response = await api.get('/assessments/my-assessments');
      return response.data;
    } catch (error) {
      console.error('Error fetching my assessments:', error);
      throw error;
    }
  },

  // Get assessment by ID
  getAssessmentById: async (assessmentId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment:', error);
      throw error;
    }
  },

  // Start a new assessment
  startAssessment: async (questionnaireId) => {
    try {
      const response = await api.post('/assessments/start', { questionnaireId });
      return response.data;
    } catch (error) {
      console.error('Error starting assessment:', error);
      throw error;
    }
  },

  // Submit answer for a question
  submitAnswer: async (assessmentId, questionId, answerData) => {
    try {
      const response = await api.post(`/assessments/${assessmentId}/answers`, {
        questionId,
        ...answerData
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  },

  // Upload evidence file
  uploadEvidence: async (assessmentId, questionId, file) => {
    try {
      const formData = new FormData();
      formData.append('evidence', file);
      formData.append('assessmentId', assessmentId);
      formData.append('questionId', questionId);

      const response = await api.post('/assessments/upload-evidence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading evidence:', error);
      throw error;
    }
  },

  // Complete assessment
  completeAssessment: async (assessmentId) => {
    try {
      const response = await api.post(`/assessments/${assessmentId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing assessment:', error);
      throw error;
    }
  },

  // Get assessment results
  getAssessmentResults: async (assessmentId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      throw error;
    }
  },

  // Get assessment progress
  getAssessmentProgress: async (assessmentId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment progress:', error);
      throw error;
    }
  },

  // Admin/Auditor: Get all assessments
  getAllAssessments: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/assessments?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all assessments:', error);
      throw error;
    }
  },

  // Admin/Auditor: Review and approve assessment
  reviewAssessment: async (assessmentId, reviewData) => {
    try {
      const response = await api.post(`/assessments/${assessmentId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error reviewing assessment:', error);
      throw error;
    }
  },
};

export default assessmentService;
