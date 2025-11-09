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
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import type { StorageEngine } from 'multer';

const router = express.Router();

// Pastikan upload directory ada
const uploadDir = path.join(process.cwd(), 'uploads', 'account-requests');
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer untuk file upload
const storage: StorageEngine = multer.diskStorage({
    destination: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, uploadDir);
    },
    filename: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
            // Return error yang bisa ditangani
            const error = new Error(`File type ${file.mimetype} not allowed`) as any;
            error.name = 'INVALID_FILE_TYPE';
            cb(error, false);
        }
    }
});

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/request-account', upload.single('affiliationProof'), submitAccountRequest as any);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

// Admin routes
router.get('/requests', authenticateToken, getAccountRequests);
router.get('/requests/:requestID', authenticateToken, getAccountRequestById);
router.post('/requests/:requestID/approve', authenticateToken, approveAccountRequest);
router.post('/requests/:requestID/reject', authenticateToken, rejectAccountRequest);

export default router;
