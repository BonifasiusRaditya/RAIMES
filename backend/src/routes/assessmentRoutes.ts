import { Router } from 'express';
import {
  startAssessment,
  saveProgress,
  getAllAssessmentsWithProgress,
  getCurrentAssessment,
  getMyAssessments,
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

// POST routes
router.post('/save-progress', saveProgress);
router.post('/complete', completeAssessment);
router.post('/score', scoreAssessmentController);

// More specific GET routes (non-parameterized)
router.get('/my-assessments', getMyAssessments);
router.get('/results', getMyAssessmentResults);
router.get('/all', getAllAssessmentsWithProgress);

// More specific GET routes with path segments
router.get('/current/:questionnaireId', getCurrentAssessment);
router.get('/detail/:assessmentId', getAssessmentDetail);

// GET routes with nested paths (before generic /:id routes)
router.get('/:assessmentId/scoring', getAssessmentScoringResult);
router.get('/:assessmentId/results', getAssessmentResults);

// PUT routes
router.put('/position/:questionnaireId', updateCurrentPosition);

// Get scoring statistics for a questionnaire (generic, placed last to avoid conflicts)
router.get('/statistics/:questionnaireId', getScoringStatistics);

export default router;
