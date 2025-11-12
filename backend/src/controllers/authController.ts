import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

interface LoginRequest {
    username: string;
    password: string;
}

interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    role: string;
}

// Login Controller
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body as LoginRequest;

        // Validasi input
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
            return;
        }

        // Query user dengan parameterized query untuk mencegah SQL injection
        const query = 'SELECT * FROM "User" WHERE username = $1';
        const result = await pool.query(query, [username]);

        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
            return;
        }

        const rawUser = result.rows[0];

        // Normalize DB column names (some DBs use userID / userid / user_id)
        const user = {
            userid: rawUser.userid ?? rawUser.userID ?? rawUser.user_id,
            username: rawUser.username,
            email: rawUser.email,
            role: rawUser.role,
            password: rawUser.password,
        };

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password || '');

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
            return;
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const token = jwt.sign(
            {
                userID: user.userid,
                username: user.username,
                email: user.email,
                role: user.role
            } as object,
            jwtSecret as jwt.Secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    userID: user.userid,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Register Controller
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, email, role } = req.body as RegisterRequest;

        // Validasi input
        if (!username || !password || !email || !role) {
            res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
            return;
        }

        // Validasi role
        const validRoles = ['admin', 'user', 'auditor'];
        if (!validRoles.includes(role.toLowerCase())) {
            res.status(400).json({
                success: false,
                message: 'Invalid role. Allowed roles: admin, user, auditor'
            });
            return;
        }

        // Check apakah username atau email sudah ada
        const checkQuery = 'SELECT * FROM "User" WHERE username = $1 OR email = $2';
        const checkResult = await pool.query(checkQuery, [username, email]);

        if (checkResult.rows.length > 0) {
            res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
            return;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user baru dengan parameterized query
        // Use RETURNING * to avoid column name mismatches (userID vs userid)
        const insertQuery = `
            INSERT INTO "User" (username, password, email, role) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `;
        const insertResult = await pool.query(insertQuery, [
            username,
            hashedPassword,
            email,
            role.toLowerCase()
        ]);

        const rawNewUser = insertResult.rows[0];
        const newUser = {
            userid: rawNewUser.userid ?? rawNewUser.userID ?? rawNewUser.user_id,
            username: rawNewUser.username,
            email: rawNewUser.email,
            role: rawNewUser.role,
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userID: newUser.userid,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Logout Controller (opsional - untuk blacklist token jika diperlukan)
export const logout = async (req: Request, res: Response): Promise<void> => {
    // Dalam implementasi sederhana, logout dilakukan di client-side
    // dengan menghapus token dari localStorage/sessionStorage
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

// Get Current User (untuk verifikasi token)
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided'
            });
            return;
        }

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

    // Query user dari database with multiple possible id column names
    const query = 'SELECT * FROM "User" WHERE userid = $1 OR "userID" = $1 OR user_id = $1';
    const result = await pool.query(query, [decoded.userID]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
