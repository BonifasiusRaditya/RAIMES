import api from "./api";

export const assessmentService = {
  // Get current assessment progress for resume functionality
  getCurrentAssessment: async (questionnaireId) => {
    try {
      console.log(
        "🔍 Getting current assessment for questionnaire:",
        questionnaireId
      );
      const response = await api.get(`/assessments/current/${questionnaireId}`);
      console.log("✅ Current assessment response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error getting current assessment:", error);
      return null; // Return null if no assessment found
    }
  },

  // Start a new assessment
  startAssessment: async (questionnaireId) => {
    try {
      console.log("🚀 Starting assessment for questionnaire:", questionnaireId);
      // Kirim string/number sesuai kebutuhan backend
      const response = await api.post("/assessments/start", {
        questionnaireId: questionnaireId,
      });
      console.log("✅ Assessment start response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error starting assessment:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Save progress when user answers a question (called on "Save & Continue")
  saveProgress: async ({ assessmentId, questionId, answer }) => {
    try {
      const response = await api.post("/assessments/save-progress", {
        assessmentId: parseInt(assessmentId),
        questionId: parseInt(questionId),
        answer,
      });
      return response.data;
    } catch (error) {
      console.error("Error saving progress:", error);
      throw error;
    }
  },

  // Update current position when user navigates (without saving answer)
  updateCurrentPosition: async (questionnaireId, currentQuestionIndex) => {
    try {
      console.log("🚶 Updating current position:", {
        questionnaireId,
        currentQuestionIndex,
      });
      const response = await api.put(
        `/assessments/position/${questionnaireId}`,
        {
          currentQuestionIndex: parseInt(currentQuestionIndex),
        }
      );
      console.log("✅ Position update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating position:", error);
      // Don't throw error for position updates, just log it
      return null;
    }
  },

  // Get assessment progress by ID
  getAssessmentProgress: async (assessmentId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/progress`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assessment progress:", error);
      throw error;
    }
  },
  // Get all assessments for current user/company
  getMyAssessments: async () => {
    try {
      const response = await api.get("/assessments/my-assessments");
      return response.data;
    } catch (error) {
      console.error("Error fetching my assessments:", error);
      throw error;
    }
  },

  // Get assessments grouped by category
  getMyAssessmentsByCategory: async () => {
    try {
      const response = await api.get("/assessments/my-assessments-by-category");
      return response.data;
    } catch (error) {
      console.error("Error fetching assessments by category:", error);
      throw error;
    }
  },

  // Get assessment by ID
  getAssessmentById: async (assessmentId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assessment:", error);
      throw error;
    }
  },

  // Submit answer for a question
  submitAnswer: async (assessmentId, questionId, answerData) => {
    try {
      const response = await api.post(`/assessments/${assessmentId}/answers`, {
        questionId,
        ...answerData,
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  },

  // Upload evidence file
  uploadEvidence: async (assessmentId, questionId, file, answerId) => {
    try {
      const formData = new FormData();
      formData.append("evidence", file);
      formData.append("assessmentId", assessmentId);
      formData.append("questionId", questionId);
      if (answerId) {
        formData.append("answerId", answerId);
      }

      const response = await api.post(
        "/assessments/upload-evidence",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading evidence:", error);
      throw error;
    }
  },

  // Fetch evidence for an assessment (optionally per question)
  getEvidence: async (assessmentId, questionId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/evidence`, {
        params: questionId ? { questionId } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching evidence:", error);
      throw error;
    }
  },

  // Delete evidence file
  deleteEvidence: async (assessmentId, evidenceId) => {
    try {
      const response = await api.delete(
        `/assessments/${assessmentId}/evidence/${evidenceId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting evidence:", error);
      throw error;
    }
  },

  // Complete assessment
  completeAssessment: async (questionnaireId) => {
    try {
      console.log(
        "🏁 Completing assessment for questionnaire:",
        questionnaireId
      );
      const response = await api.post("/assessments/complete", {
        questionnaireId: parseInt(questionnaireId),
      });
      console.log("✅ Assessment completed:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error completing assessment:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Request AI scoring for a completed assessment
  requestAIScoring: async (assessmentId) => {
    try {
      console.log("🤖 Requesting AI scoring for assessment:", assessmentId);
      const response = await api.post("/assessments/score", {
        assessmentId: parseInt(assessmentId),
      });
      console.log("✅ AI scoring response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error requesting AI scoring:", error);
      throw error;
    }
  },

  // Get AI scoring result for an assessment
  getAIScoringResult: async (assessmentId) => {
    try {
      console.log("📊 Getting AI scoring result for assessment:", assessmentId);
      const response = await api.get(`/assessments/${assessmentId}/scoring`);
      console.log("✅ AI scoring result:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error getting AI scoring result:", error);
      // Return null instead of throwing to allow fallback to finalScore
      return null;
    }
  },

  // Get assessment results
  getAssessmentResults: async (assessmentId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/results`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assessment results:", error);
      throw error;
    }
  },

  // Get assessment detail with questions and answers
  getAssessmentDetail: async (assessmentId) => {
    try {
      console.log("📡 Fetching assessment detail for ID:", assessmentId);
      const response = await api.get(`/assessments/detail/${assessmentId}`);
      console.log("✅ Assessment detail response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching assessment detail:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },

  // Save reviewer notes for an assessment
  saveReviewerNotes: async (
    assessmentId,
    reviewerNotes,
    questionReviewerNotes = {}
  ) => {
    try {
      console.log("💾 Saving reviewer notes for assessment:", assessmentId);
      const response = await api.put(
        `/assessments/${assessmentId}/reviewer-notes`,
        {
          reviewerNotes,
          questionReviewerNotes,
        }
      );
      console.log("✅ Reviewer notes saved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error saving reviewer notes:", error);
      throw error;
    }
  },

  // Admin/Auditor: Get all assessments
  getAllAssessments: async (filters = {}) => {
    try {
      console.log("🔍 getAllAssessments called with filters:", filters);
      const params = new URLSearchParams(filters);
      console.log("📡 Making request to:", `/assessments/all?${params}`);
      const response = await api.get(`/assessments/all?${params}`);
      console.log("✅ getAllAssessments response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching all assessments:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Admin/Auditor: Review and approve assessment
  reviewAssessment: async (assessmentId, reviewData) => {
    try {
      const response = await api.post(
        `/assessments/${assessmentId}/review`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error reviewing assessment:", error);
      throw error;
    }
  },
};
