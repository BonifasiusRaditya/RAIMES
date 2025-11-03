import express from 'express';
import aiController from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Analyze a complete questionnaire
router.post('/analyze', authenticateToken, aiController.analyzeQuestionnaire);

// Get dummy analysis (for testing)
router.get('/dummy-analysis', aiController.getDummyAnalysis);

export default router;