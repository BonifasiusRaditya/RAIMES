import express from 'express';
import { login, register, logout, getCurrentUser } from '../controllers/authController.js';
import {
    submitAccountRequest,
    getAccountRequests,
    getAccountRequestById,
    approveAccountRequest,
    rejectAccountRequest
} from '../controllers/accountRequestController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer untuk file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/account-requests/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/request-account', upload.single('affiliationProof'), submitAccountRequest);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

// Admin routes
router.get('/requests', authenticateToken, getAccountRequests);
router.get('/requests/:requestID', authenticateToken, getAccountRequestById);
router.post('/requests/:requestID/approve', authenticateToken, approveAccountRequest);
router.post('/requests/:requestID/reject', authenticateToken, rejectAccountRequest);

export default router;
