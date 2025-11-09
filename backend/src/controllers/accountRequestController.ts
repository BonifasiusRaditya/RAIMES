import type { Request, Response } from 'express';
import pool from '../config/database.js';

interface AccountRequestData {
    username: string;
    email: string;
    companyName: string;
    affiliationProofFileName: string;
    affiliationProofPath: string;
    affiliationProofType: string;
}

interface MulterRequest extends Request {
    file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
    };
}

// Submit account request
export const submitAccountRequest = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
        const { username, email, companyName } = req.body as {
            username: string;
            email: string;
            companyName: string;
        };

        // Validasi input
        if (!username || !email || !companyName) {
            res.status(400).json({
                success: false,
                message: 'Username, email, and company name are required'
            });
            return;
        }

        // Check jika file sudah di-upload
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Affiliation proof file is required'
            });
            return;
        }

        // Validasi tipe file (hanya image dan document)
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            res.status(400).json({
                success: false,
                message: 'Only image files (JPG, PNG, GIF) and document files (PDF, DOC, DOCX) are allowed'
            });
            return;
        }

        // Validasi ukuran file (max 10MB)
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        if (req.file.size > maxFileSize) {
            res.status(400).json({
                success: false,
                message: 'File size must not exceed 10MB'
            });
            return;
        }

        // Check apakah email sudah pernah di-request atau sudah ada di User table
        const checkQuery = `
            SELECT * FROM "AccountRequest" WHERE email = $1 AND status = 'pending'
            UNION
            SELECT userid, email FROM "User" WHERE email = $2
        `;
        const checkResult = await pool.query(checkQuery, [email, email]);

        if (checkResult.rows.length > 0) {
            res.status(409).json({
                success: false,
                message: 'Email already has a pending request or is registered'
            });
            return;
        }

        // Check apakah username sudah pernah di-request atau sudah ada di User table
        const usernameCheckQuery = `
            SELECT * FROM "AccountRequest" WHERE username = $1 AND status = 'pending'
            UNION
            SELECT userid, username FROM "User" WHERE username = $2
        `;
        const usernameCheckResult = await pool.query(usernameCheckQuery, [username, username]);

        if (usernameCheckResult.rows.length > 0) {
            res.status(409).json({
                success: false,
                message: 'Username already has a pending request or is registered'
            });
            return;
        }

        // Insert account request ke database
        const insertQuery = `
            INSERT INTO "AccountRequest" (
                username, 
                email, 
                companyName, 
                affiliationProofFileName, 
                affiliationProofPath, 
                affiliationProofType
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING requestID, username, email, companyName, status, requestDate
        `;

        const fileStoragePath = `uploads/account-requests/${Date.now()}-${req.file.originalname}`;

        const insertResult = await pool.query(insertQuery, [
            username,
            email,
            companyName,
            req.file.originalname,
            fileStoragePath,
            req.file.mimetype
        ]);

        const newRequest = insertResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'Account request submitted successfully. Admin will review your request soon.',
            data: {
                requestID: newRequest.requestID,
                username: newRequest.username,
                email: newRequest.email,
                companyName: newRequest.companyName,
                status: newRequest.status,
                requestDate: newRequest.requestDate
            }
        });
    } catch (error) {
        console.error('Submit account request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all account requests (admin only)
export const getAccountRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT 
                requestID,
                username,
                email,
                companyName,
                affiliationProofFileName,
                status,
                requestDate,
                adminNotes,
                reviewedDate
            FROM "AccountRequest"
            ORDER BY 
                CASE 
                    WHEN status = 'pending' THEN 1
                    WHEN status = 'approved' THEN 2
                    WHEN status = 'rejected' THEN 3
                    ELSE 4
                END,
                requestDate DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get account requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get account request by ID (admin only)
export const getAccountRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requestID } = req.params;

        const query = `
            SELECT * FROM "AccountRequest" WHERE requestID = $1
        `;

        const result = await pool.query(query, [requestID]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Account request not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get account request by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Approve account request (admin only)
export const approveAccountRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requestID } = req.params;
        const { password, role = 'user' } = req.body as {
            password: string;
            role?: string;
        };

        // Validasi input
        if (!password) {
            res.status(400).json({
                success: false,
                message: 'Password is required'
            });
            return;
        }

        // Get account request
        const selectQuery = `
            SELECT * FROM "AccountRequest" WHERE requestID = $1 AND status = 'pending'
        `;

        const selectResult = await pool.query(selectQuery, [requestID]);

        if (selectResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Account request not found or already processed'
            });
            return;
        }

        const accountRequest = selectResult.rows[0];
        const bcrypt = await import('bcryptjs');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.default.hash(password, saltRounds);

        // Mulai transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Create user
            const createUserQuery = `
                INSERT INTO "User" (username, password, email, role)
                VALUES ($1, $2, $3, $4)
                RETURNING userid
            `;

            const createUserResult = await client.query(createUserQuery, [
                accountRequest.username,
                hashedPassword,
                accountRequest.email,
                role.toLowerCase()
            ]);

            const newUserID = createUserResult.rows[0].userid;

            // Create company
            const createCompanyQuery = `
                INSERT INTO Company (companyName, registrationDate, userID)
                VALUES ($1, NOW(), $2)
                RETURNING companyID
            `;

            await client.query(createCompanyQuery, [
                accountRequest.companyName,
                newUserID
            ]);

            // Update account request status
            const updateRequestQuery = `
                UPDATE "AccountRequest"
                SET status = $1, reviewedDate = NOW(), reviewedBy = $2, adminNotes = $3
                WHERE requestID = $4
            `;

            await client.query(updateRequestQuery, [
                'approved',
                req.body.adminID || null,
                'Account approved',
                requestID
            ]);

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                message: 'Account request approved successfully',
                data: {
                    userID: newUserID,
                    username: accountRequest.username,
                    email: accountRequest.email,
                    companyName: accountRequest.companyName
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Approve account request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Reject account request (admin only)
export const rejectAccountRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requestID } = req.params;
        const { reason } = req.body as { reason: string };

        if (!reason) {
            res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
            return;
        }

        const updateQuery = `
            UPDATE "AccountRequest"
            SET status = $1, reviewedDate = NOW(), adminNotes = $2
            WHERE requestID = $3 AND status = 'pending'
            RETURNING *
        `;

        const result = await pool.query(updateQuery, [
            'rejected',
            reason,
            requestID
        ]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Account request not found or already processed'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Account request rejected'
        });
    } catch (error) {
        console.error('Reject account request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
