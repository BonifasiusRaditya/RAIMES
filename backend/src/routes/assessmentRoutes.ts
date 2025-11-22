import { Router } from 'express';
import {
  startAssessment,
  saveProgress,
  getAllAssessmentsWithProgress,
  getCurrentAssessment,
  getUserAssessments,
  updateCurrentPosition
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

// Get user's assessments
router.get('/my-assessments', getUserAssessments);

// Admin/Auditor routes - get all assessments with progress
router.get('/all', getAllAssessmentsWithProgress);

export default router;
