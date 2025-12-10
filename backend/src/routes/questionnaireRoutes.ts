import { Router } from 'express';
import {
  testQuestionnaires,
  getAllQuestionnaires,
  getQuestionnaireById,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  getQuestionnaireStats
} from '../controllers/questionnaireController.js';

const router = Router();

// Test endpoint
router.get('/test', testQuestionnaires);

// Stats endpoint
router.get('/stats', getQuestionnaireStats);

// CRUD endpoints
router.get('/', getAllQuestionnaires);
router.get('/:id', getQuestionnaireById);
router.post('/', createQuestionnaire);
router.put('/:id', updateQuestionnaire);
router.delete('/:id', deleteQuestionnaire);

export default router;
