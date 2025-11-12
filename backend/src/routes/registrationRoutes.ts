import express from 'express';
import {
  createRegistrationRequest,
  getAllRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  checkRegistrationStatus,
  getRegistrationRequestStats
} from '../controllers/registrationController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes (mounted on /api/auth)
router.post('/register-request', createRegistrationRequest);
router.get('/check-registration-status/:email', checkRegistrationStatus);

// Admin only routes (mounted on /api/admin)
router.get('/registration-requests', authenticateToken, authorizeRoles('admin'), getAllRegistrationRequests);
router.get('/registration-requests/stats', authenticateToken, authorizeRoles('admin'), getRegistrationRequestStats);
router.post('/registration-requests/:id/approve', authenticateToken, authorizeRoles('admin'), approveRegistrationRequest);
router.post('/registration-requests/:id/reject', authenticateToken, authorizeRoles('admin'), rejectRegistrationRequest);

export default router;