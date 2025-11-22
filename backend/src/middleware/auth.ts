import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userID: number;
        username: string;
        email: string;
        role: string;
    };
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔐 Auth middleware - authHeader:', authHeader);
    console.log('🎯 Auth middleware - token:', token ? 'Token present' : 'No token');

    if (!token) {
        console.log('❌ No token provided');
        res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
        return;
    }

    try {
        interface JWTPayload {
            userID: number;
            username: string;
            email: string;
            role: string;
        }

        const decoded = jwt.verify(
            token,
            (process.env.JWT_SECRET || 'default_secret') as jwt.Secret
        ) as JWTPayload;
        
        console.log('✅ Token decoded successfully:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('❌ Token verification failed:', error);
        res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
        return;
    }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ 
                success: false, 
                message: 'Access denied: Insufficient permissions' 
            });
            return;
        }

        next();
    };
};
