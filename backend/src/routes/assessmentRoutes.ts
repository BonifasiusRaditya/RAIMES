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
  getScoringStatistics,
  saveReviewerNotes,
  uploadEvidence,
  getEvidenceForAssessment
} from '../controllers/assessmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer setup for evidence uploads
const evidenceDir = path.resolve(process.cwd(), 'uploads', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const evidenceStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, evidenceDir),
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  }
});

const evidenceUpload = multer({
  storage: evidenceStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

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
router.post('/upload-evidence', evidenceUpload.single('evidence'), uploadEvidence);
router.post('/complete', completeAssessment);
router.post('/score', scoreAssessmentController);

// More specific GET routes (non-parameterized)
router.get('/my-assessments', getMyAssessments);

// Get user's completed assessment results
router.get('/results', getMyAssessmentResults);
router.get('/all', getAllAssessmentsWithProgress);

// More specific GET routes with path segments
router.get('/current/:questionnaireId', getCurrentAssessment);
router.get('/detail/:assessmentId', getAssessmentDetail);
router.get('/:assessmentId/evidence', getEvidenceForAssessment);

// GET routes with nested paths (before generic /:id routes)
router.get('/:assessmentId/scoring', getAssessmentScoringResult);
router.get('/:assessmentId/results', getAssessmentResults);

// PUT routes
router.put('/position/:questionnaireId', updateCurrentPosition);
router.put('/:assessmentId/reviewer-notes', saveReviewerNotes);

// Get scoring statistics for a questionnaire (generic, placed last to avoid conflicts)
router.get('/statistics/:questionnaireId', getScoringStatistics);

export default router;
