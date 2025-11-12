import type { Request, Response } from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

interface RegistrationRequestBody {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'auditor';
  companyname?: string;
  address?: string;
}

// POST /api/auth/register-request
// Public endpoint untuk user/auditor mengajukan registrasi
export const createRegistrationRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role, companyname, address }: RegistrationRequestBody = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Username, email, password, and role are required'
      });
      return;
    }

    if (!['user', 'auditor'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Role must be either "user" or "auditor"'
      });
      return;
    }

    if (role === 'user' && !companyname) {
      res.status(400).json({
        success: false,
        message: 'Company name is required for user registration'
      });
      return;
    }

    // Check if email already exists in User table
    const existingUser = await pool.query(
      'SELECT userid FROM "User" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
      return;
    }

    // Check if username already exists in User table
    const existingUsername = await pool.query(
      'SELECT userid FROM "User" WHERE username = $1',
      [username]
    );

    if (existingUsername.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
      return;
    }

    // Check if email already has pending request
    const existingRequest = await pool.query(
      'SELECT requestid FROM RegistrationRequest WHERE email = $1 AND status = $2',
      [email, 'pending']
    );

    if (existingRequest.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'You already have a pending registration request. Please wait for admin approval.'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert registration request
    const result = await pool.query(
      `INSERT INTO RegistrationRequest (username, email, password, role, companyname, address, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING requestid, username, email, role, companyname, status, requested_at`,
      [username, email, hashedPassword, role, companyname || null, address || null]
    );

    const newRequest = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully. Please wait for admin approval.',
      data: {
        requestid: newRequest.requestid,
        username: newRequest.username,
        email: newRequest.email,
        role: newRequest.role,
        status: newRequest.status,
        requested_at: newRequest.requested_at
      }
    });
  } catch (error) {
    console.error('Error creating registration request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating registration request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/admin/registration-requests
// Admin only - Melihat semua registration requests
export const getAllRegistrationRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        rr.requestid, rr.username, rr.email, rr.role, rr.companyname, rr.address, 
        rr.status, rr.rejection_reason, rr.requested_at, rr.reviewed_at, rr.reviewed_by,
        u.username as reviewer_username
      FROM RegistrationRequest rr
      LEFT JOIN "User" u ON rr.reviewed_by = u.userid
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
      query += ` AND rr.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY 
      CASE 
        WHEN rr.status = 'pending' THEN 1
        WHEN rr.status = 'approved' THEN 2
        WHEN rr.status = 'rejected' THEN 3
      END,
      rr.requested_at DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error getting registration requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving registration requests',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/admin/registration-requests/stats
// Admin only - Statistik registration requests
export const getRegistrationRequestStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) as total
      FROM RegistrationRequest
    `);

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting registration request stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/admin/registration-requests/:id/approve
// Admin only - Approve registration request
export const approveRegistrationRequest = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const adminUserId = (req as any).user?.userID; // Changed from userid to userID

    if (!adminUserId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Admin authentication required'
      });
      return;
    }

    await client.query('BEGIN');

    // Get registration request
    const requestResult = await client.query(
      'SELECT * FROM RegistrationRequest WHERE requestid = $1 AND status = $2',
      [id, 'pending']
    );

    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        message: 'Registration request not found or already processed'
      });
      return;
    }

    const request = requestResult.rows[0];

    // Check if username or email already exists (double check)
    const existingUser = await client.query(
      'SELECT userid FROM "User" WHERE username = $1 OR email = $2',
      [request.username, request.email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({
        success: false,
        message: 'Username or email already exists in the system'
      });
      return;
    }

    // Create user account
    const userResult = await client.query(
      `INSERT INTO "User" (username, password, email, role)
       VALUES ($1, $2, $3, $4)
       RETURNING userid, username, email, role`,
      [request.username, request.password, request.email, request.role]
    );

    const newUser = userResult.rows[0];

    // If role is 'user', create company record
    if (request.role === 'user') {
      await client.query(
        `INSERT INTO Company (companyname, address, registrationdate, userid)
         VALUES ($1, $2, CURRENT_DATE, $3)`,
        [request.companyname, request.address, newUser.userid]
      );
    }

    // Update registration request status
    await client.query(
      `UPDATE RegistrationRequest 
       SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $1
       WHERE requestid = $2`,
      [adminUserId, id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Registration request approved successfully. User can now login.',
      data: {
        userid: newUser.userid,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving registration request:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving registration request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    client.release();
  }
};

// POST /api/admin/registration-requests/:id/reject
// Admin only - Reject registration request
export const rejectRegistrationRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, rejection_reason } = req.body; // Support both field names
    const adminUserId = (req as any).user?.userID; // Changed from userid to userID
    const finalReason = reason || rejection_reason; // Use whichever is provided

    if (!adminUserId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Admin authentication required'
      });
      return;
    }

    if (!finalReason || !finalReason.trim()) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
      return;
    }

    // Get request for verification
    const requestResult = await pool.query(
      'SELECT email, username, status FROM RegistrationRequest WHERE requestid = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Registration request not found'
      });
      return;
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${request.status}`
      });
      return;
    }

    // Update status to rejected
    await pool.query(
      `UPDATE RegistrationRequest 
       SET status = 'rejected', rejection_reason = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2
       WHERE requestid = $3`,
      [finalReason.trim(), adminUserId, id]
    );

    res.status(200).json({
      success: true,
      message: 'Registration request rejected',
      data: {
        requestid: id,
        email: request.email,
        username: request.username,
        reason: finalReason.trim()
      }
    });
  } catch (error) {
    console.error('Error rejecting registration request:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting registration request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/auth/check-registration-status/:email
// Public endpoint - Check status of registration request
export const checkRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    const result = await pool.query(
      `SELECT requestid, username, email, role, status, rejection_reason, requested_at, reviewed_at
       FROM RegistrationRequest 
       WHERE email = $1 
       ORDER BY requested_at DESC 
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No registration request found for this email'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking registration status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
