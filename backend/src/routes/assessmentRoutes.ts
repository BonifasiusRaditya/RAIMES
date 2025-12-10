import { Router } from 'express';
import {
  startAssessment,
  saveProgress,
  getAllAssessmentsWithProgress,
  getCurrentAssessment,
  getMyAssessments,
  getMyAssessmentsByCategory,
  getMyAssessmentResults,
  updateCurrentPosition,
  getAssessmentDetail,
  getAssessmentResults,
  completeAssessment,
  scoreAssessmentController,
  getAssessmentScoringResult,
  getScoringStatistics
} from '../controllers/assessmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Test endpoint without auth
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Assessment routes are working',
    timestamp: new Date().toISOString()
  });
});

// All routes require authentication
router.use(authenticateToken);

// Start a new assessment
router.post('/start', startAssessment);

// Get current assessment progress for a questionnaire
router.get('/current/:questionnaireId', getCurrentAssessment);

// Update current position without saving answer (for navigation tracking)
router.put('/position/:questionnaireId', updateCurrentPosition);

// Save progress (called when "Save & Continue" is clicked)
router.post('/save-progress', saveProgress);

// Complete assessment (called when "Complete Assessment" is clicked)
router.post('/complete', completeAssessment);

// Score assessment using AI Engine
router.post('/score', scoreAssessmentController);

// Get assessment scoring result
router.get('/:assessmentId/scoring', getAssessmentScoringResult);

// Get scoring statistics for a questionnaire
router.get('/statistics/:questionnaireId', getScoringStatistics);

// Get user's assessments
router.get('/my-assessments', getMyAssessments);

// Get user's assessments grouped by category
router.get('/my-assessments-by-category', getMyAssessmentsByCategory);

// Get user's completed assessment results
router.get('/results', getMyAssessmentResults);

// Get assessment detail by ID
router.get('/detail/:assessmentId', getAssessmentDetail);

// Get summarized assessment results by ID
router.get('/:assessmentId/results', getAssessmentResults);

// Admin/Auditor routes - get all assessments with progress
router.get('/all', getAllAssessmentsWithProgress);

export default router;
