import { Router } from 'express';
import { sendContactEmail } from '../controllers/contactController.js';

const router = Router();

// POST /api/contact - Send contact form email
router.post('/', sendContactEmail);

export default router;
