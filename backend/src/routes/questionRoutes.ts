import { Router } from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionCategories,
  getQuestionStats,
  testQuestions,
  getAllQuestionsPublic
} from '../controllers/questionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public endpoints (no authentication required)
router.get('/test', testQuestions);
router.get('/public', getAllQuestionsPublic);

// Apply authentication middleware to all other routes
router.use(authenticateToken);

// Protected question routes
router.get('/', getAllQuestions);
router.get('/categories', getQuestionCategories);
router.get('/stats', getQuestionStats);
router.get('/:id', getQuestionById);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
