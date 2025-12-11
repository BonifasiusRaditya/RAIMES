import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import questionnaireRoutes from './routes/questionnaireRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
console.log('🟢 Sebelum CORS middleware');
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174',
        'http://localhost:3000',
        'https://raimes-q7hx.vercel.app',
        'https://raimes.vercel.app',
        process.env.FRONTEND_URL || 'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('🟢 Setelah CORS middleware');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded evidence files
const uploadsRoot = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadsRoot, { recursive: true });
app.use('/uploads', express.static(uploadsRoot));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        message: 'RAIMES Backend API',
        version: '1.0.0',
        status: 'running'
    });
});

app.get('/api/status', (req: Request, res: Response) => {
    res.json({ 
        status: 'OK', 
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Registration request routes
app.use('/api/auth', registrationRoutes);
app.use('/api/admin', registrationRoutes);

// Questionnaire routes
app.use('/api/questionnaires', questionnaireRoutes);

// Question routes  
app.use('/api/questions', questionRoutes);

// Assessment routes
app.use('/api/assessments', assessmentRoutes);

// Contact routes
app.use('/api/contact', contactRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
