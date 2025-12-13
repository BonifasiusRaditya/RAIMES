import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import pool from '../config/database.js';

interface AuthRequest extends Request {
  user?: {
    userID: number;
    username: string;
    email: string;
    role: string;
    companyid?: number;
  };
}

// Types for database results
interface AssessmentResult {
  assessmentid: number;
  companyid: number;
  questionnaireid: number;
  status: string;
  finalscore?: number;
  startdate: string;
  completiondate?: string;
  username: string;
  companyname: string;
}

interface AnswerResult {
  answerid: number;
  questionid: number;
  response: string;
}

// Ensure the Evidence table exists before attempting to store files
let evidenceTableEnsured = false;
const ensureEvidenceTable = async (): Promise<void> => {
  if (evidenceTableEnsured) return;

  // Create table and add safety columns/indexes if they are missing
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Evidence (
      evidenceid SERIAL PRIMARY KEY,
      answerid INTEGER NOT NULL,
      filename VARCHAR(255) NOT NULL,
      originalname VARCHAR(255),
      filetype VARCHAR(128),
      storagepath VARCHAR(1024) NOT NULL,
      uploaddate TIMESTAMPTZ DEFAULT NOW(),
      uploaderid INTEGER,
      CONSTRAINT fk_evidence_answer FOREIGN KEY (answerid) REFERENCES Answer(answerid) ON DELETE CASCADE,
      CONSTRAINT fk_evidence_user FOREIGN KEY (uploaderid) REFERENCES "User"(userid) ON DELETE SET NULL
    );
  `);

  await pool.query('ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS originalname VARCHAR(255);');
  await pool.query('ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS filetype VARCHAR(128);');
  await pool.query('ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS storagepath VARCHAR(1024);');
  await pool.query('ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS uploaddate TIMESTAMPTZ DEFAULT NOW();');
  await pool.query('ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS uploaderid INTEGER;');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_evidence_answerid ON Evidence(answerid);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_evidence_uploaderid ON Evidence(uploaderid);');

  evidenceTableEnsured = true;
};

// Start a new assessment
export const startAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 startAssessment called with:', {
      body: req.body,
      user: req.user,
      headers: req.headers.authorization
    });
    
    const { questionnaireId } = req.body;
    const userId = req.user?.userID;

    console.log('📊 Extracted values:', { questionnaireId, userId, userObject: req.user });

    if (!questionnaireId || !userId) {
      console.log('❌ Missing required data:', { questionnaireId, userId });
      res.status(400).json({
        success: false,
        message: `Missing required data - questionnaireId: ${questionnaireId}, userId: ${userId}`
      });
      return;
    }

    // Get user's company information
    const userCompanyQuery = `
      SELECT c.companyid, c.companyname
      FROM Company c
      WHERE c.userid = $1
    `;
    
    const userCompanyResult = await pool.query(userCompanyQuery, [userId]);
    
    if (userCompanyResult.rows.length === 0) {
      console.log('❌ No company found for user:', userId);
      res.status(404).json({
        success: false,
        message: 'No company associated with this user'
      });
      return;
    }
    
    const companyId = userCompanyResult.rows[0].companyid;
    const companyName = userCompanyResult.rows[0].companyname;
    
    console.log('✅ Found company for user:', { userId, companyId, companyName });

    // Check if assessment already exists for this company and questionnaire
    const existingQuery = `
      SELECT a.*, u.username, c.companyname 
      FROM Assessment a
      JOIN Company c ON a.companyid = c.companyid
      JOIN "User" u ON c.userid = u.userid
      WHERE a.companyid = $1 AND a.questionnaireid = $2
    `;
    
    const existingResult = await pool.query(existingQuery, [companyId, questionnaireId]);

    if (existingResult.rows.length > 0) {
      const assessment = existingResult.rows[0];
      
      // Get answered questions count
      const answeredQuery = `
        SELECT COUNT(*) as answered_count 
        FROM Answer 
        WHERE assessmentid = $1
      `;
      const answeredResult = await pool.query(answeredQuery, [assessment.assessmentid]);
      const answeredCount = parseInt(answeredResult.rows[0].answered_count);
      
      // Get total questions count
      const totalQuery = `
        SELECT COUNT(*) as total_count 
        FROM Question 
        WHERE questionnaireid = $1
      `;
      const totalResult = await pool.query(totalQuery, [questionnaireId]);
      const totalQuestions = parseInt(totalResult.rows[0].total_count);
      
      const progressPercentage = totalQuestions > 0 
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;
      
      res.json({
        success: true,
        message: 'Assessment already exists',
        data: {
          id: assessment.assessmentid,
          questionnaireId: assessment.questionnaireid,
          answeredQuestions: answeredCount,
          totalQuestions,
          progressPercentage,
          status: assessment.status,
          started_at: assessment.startdate,
          nextQuestionIndex: answeredCount // Start from next unanswered question
        }
      });
      return;
    }

    // Create new assessment
    const insertQuery = `
      INSERT INTO Assessment (companyid, questionnaireid, status, startdate)
      VALUES ($1, $2, 'in_progress', NOW())
      RETURNING assessmentid, startdate
    `;
    
    const insertResult = await pool.query(insertQuery, [companyId, questionnaireId]);
    const newAssessment = insertResult.rows[0];
    
    // Get total questions count
    const totalQuery = `
      SELECT COUNT(*) as total_count 
      FROM Question 
      WHERE questionnaireid = $1
    `;
    const totalResult = await pool.query(totalQuery, [questionnaireId]);
    const totalQuestions = parseInt(totalResult.rows[0].total_count);

    console.log('✅ Created new assessment:', {
      assessmentId: newAssessment.assessmentid,
      companyId,
      questionnaireId,
      totalQuestions
    });

    res.status(201).json({
      success: true,
      message: 'Assessment started successfully',
      data: {
        id: newAssessment.assessmentid,
        questionnaireId: questionnaireId,
        answeredQuestions: 0,
        totalQuestions,
        progressPercentage: 0,
        status: 'in_progress',
        started_at: newAssessment.startdate,
        nextQuestionIndex: 0
      }
    });

  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting assessment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Save progress when user answers a question (called on "Save & Continue")
export const saveProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assessmentId, questionId, answer } = req.body;
    const userId = req.user?.userID;

    console.log('💾 Saving progress:', { assessmentId, questionId, answer, userId });

    if (!assessmentId || !questionId || answer === undefined || !userId) {
      res.status(400).json({
        success: false,
        message: 'Missing required data - assessmentId, questionId, answer, and userId are required'
      });
      return;
    }

    // Get user's company information
    const userCompanyQuery = `
      SELECT c.companyid, c.companyname
      FROM Company c
      WHERE c.userid = $1
    `;
    
    const userCompanyResult = await pool.query(userCompanyQuery, [userId]);
    
    if (userCompanyResult.rows.length === 0) {
      console.log('❌ No company found for user:', userId);
      res.status(404).json({
        success: false,
        message: 'No company associated with this user'
      });
      return;
    }
    
    const companyId = userCompanyResult.rows[0].companyid;

    const assessmentIdNum = Number(assessmentId);
    const questionIdNum = Number(questionId);

    if (Number.isNaN(assessmentIdNum) || Number.isNaN(questionIdNum)) {
      res.status(400).json({
        success: false,
        message: 'assessmentId and questionId must be valid numbers'
      });
      return;
    }

    // Attempt to resolve assessment either by explicit assessmentId or (legacy) questionnaireId payload
    let assessment: any | null = null;

    const assessmentByIdQuery = `
      SELECT * FROM Assessment
      WHERE assessmentid = $1 AND companyid = $2
    `;
    const assessmentByIdResult = await pool.query(assessmentByIdQuery, [assessmentIdNum, companyId]);

    if (assessmentByIdResult.rows.length > 0) {
      assessment = assessmentByIdResult.rows[0];
    }

    if (!assessment) {
      const assessmentByQuestionnaireQuery = `
        SELECT * FROM Assessment
        WHERE companyid = $1 AND questionnaireid = $2
      `;
      const assessmentByQuestionnaire = await pool.query(assessmentByQuestionnaireQuery, [companyId, assessmentIdNum]);
      if (assessmentByQuestionnaire.rows.length > 0) {
        assessment = assessmentByQuestionnaire.rows[0];
      }
    }

    if (!assessment) {
      console.log(`❌ Assessment not found for company ${companyId} using identifier ${assessmentId}`);
      res.status(404).json({
        success: false,
        message: `Assessment not found for company ${companyId}`
      });
      return;
    }
    
    const questionnaireIdNum = Number(assessment.questionnaireid);
    
    console.log(`💾 Saving answer for question ${questionIdNum} in assessment ${assessment.assessmentid}: "${answer}"`);
    
    // Save or update answer in database using UPSERT
    const upsertAnswerQuery = `
      INSERT INTO Answer (assessmentid, questionid, response)
      VALUES ($1, $2, $3)
      ON CONFLICT (assessmentid, questionid)
      DO UPDATE SET response = EXCLUDED.response
      RETURNING answerid
    `;
    
    const answerResult = await pool.query(upsertAnswerQuery, [assessment.assessmentid, questionIdNum, answer || '']);
    const answerId = answerResult.rows[0].answerid;
    
    // Get current progress counts with detailed info
    const progressQuery = `
      SELECT 
        COUNT(a.answerid) as answered_count,
        (SELECT COUNT(*) FROM Question WHERE questionnaireid = $2) as total_count,
        (SELECT jsonb_agg(q.questionid ORDER BY q.questionid) FROM Question q WHERE q.questionnaireid = $2) as all_question_ids,
        (SELECT jsonb_agg(a2.questionid ORDER BY a2.questionid) FROM Answer a2 WHERE a2.assessmentid = $1) as answered_question_ids
      FROM Answer a
      WHERE a.assessmentid = $1
    `;
    
    const progressResult = await pool.query(progressQuery, [assessment.assessmentid, questionnaireIdNum]);
    const { answered_count, total_count, all_question_ids, answered_question_ids } = progressResult.rows[0];
    
    const answeredCount = parseInt(answered_count);
    const totalQuestions = parseInt(total_count);
    
    console.log('📊 Progress Details:', {
      answeredCount,
      totalQuestions,
      allQuestionIds: all_question_ids,
      answeredQuestionIds: answered_question_ids,
      missingQuestions: all_question_ids ? all_question_ids.filter((id: any) => !answered_question_ids?.includes(id)) : []
    });
    
    // Calculate precise progress percentage
    const progressPercentage = totalQuestions > 0 
      ? Math.round((answeredCount / totalQuestions) * 100 * 100) / 100 // Round to 2 decimal places
      : 0;
    
    // Update assessment status if all questions answered
    if (answeredCount >= totalQuestions) {
      const updateStatusQuery = `
        UPDATE Assessment 
        SET status = 'completed', completiondate = NOW()
        WHERE assessmentid = $1
      `;
      await pool.query(updateStatusQuery, [assessment.assessmentid]);
    }

    console.log(`✅ Progress saved! Question ${questionIdNum} answered`, {
      assessmentId: assessment.assessmentid,
      answerId,
      userId,
      answeredCount,
      totalQuestions,
      progressPercentage
    });

    res.status(200).json({
      success: true,
      message: 'Progress saved successfully',
      data: {
        assessmentId: assessment.assessmentid,
        questionId: questionIdNum,
        answerId,
        progressPercentage,
        answeredCount,
        totalQuestions,
        status: answeredCount >= totalQuestions ? 'completed' : 'in_progress'
      }
    });

  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving progress',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Upload an evidence file for a specific question/assessment
export const uploadEvidence = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const userId = req.user?.userID;
    const userRole = req.user?.role;
    const { assessmentId, questionId, answerId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized: missing user context' });
      return;
    }

    if (!file) {
      res.status(400).json({ success: false, message: 'Evidence file is required' });
      return;
    }

    const assessmentIdNum = Number(assessmentId);
    const questionIdNum = Number(questionId);
    const answerIdNum = answerId ? Number(answerId) : null;

    if (Number.isNaN(assessmentIdNum) || Number.isNaN(questionIdNum)) {
      res.status(400).json({ success: false, message: 'assessmentId and questionId must be valid numbers' });
      return;
    }

    await ensureEvidenceTable();

    // Verify the assessment exists and belongs to the requesting user (unless admin/auditor)
    const assessmentQuery = `SELECT assessmentid, companyid FROM Assessment WHERE assessmentid = $1`;
    const assessmentResult = await pool.query(assessmentQuery, [assessmentIdNum]);

    if (assessmentResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    const assessmentCompanyId = assessmentResult.rows[0].companyid;

    if (userRole !== 'admin' && userRole !== 'auditor') {
      const companyLookup = await pool.query('SELECT companyid FROM Company WHERE userid = $1', [userId]);
      const userCompanyId = companyLookup.rows[0]?.companyid;
      if (!userCompanyId || userCompanyId !== assessmentCompanyId) {
        res.status(403).json({ success: false, message: 'Access denied for this assessment' });
        return;
      }
    }

    // Resolve answerId: validate provided ID or create/find one for the assessment/question pair
    let answerIdToUse: number | null = null;

    if (answerIdNum && !Number.isNaN(answerIdNum)) {
      const answerCheckQuery = `SELECT answerid, assessmentid, questionid FROM Answer WHERE answerid = $1`;
      const answerCheck = await pool.query(answerCheckQuery, [answerIdNum]);

      if (
        answerCheck.rows.length === 0 ||
        answerCheck.rows[0].assessmentid !== assessmentIdNum ||
        answerCheck.rows[0].questionid !== questionIdNum
      ) {
        res.status(400).json({ success: false, message: 'Invalid answerId for this assessment/question' });
        return;
      }

      answerIdToUse = answerCheck.rows[0].answerid;
    } else {
      const existingAnswerQuery = `SELECT answerid FROM Answer WHERE assessmentid = $1 AND questionid = $2`;
      const existingAnswer = await pool.query(existingAnswerQuery, [assessmentIdNum, questionIdNum]);

      if (existingAnswer.rows.length > 0) {
        answerIdToUse = existingAnswer.rows[0].answerid;
      } else {
        const insertAnswerQuery = `
          INSERT INTO Answer (assessmentid, questionid, response)
          VALUES ($1, $2, '')
          RETURNING answerid
        `;
        const insertedAnswer = await pool.query(insertAnswerQuery, [assessmentIdNum, questionIdNum]);
        answerIdToUse = insertedAnswer.rows[0].answerid;
      }
    }

    const storedFilename = file.filename;
    // Use posix path to keep forward slashes in DB regardless of OS
    const relativePath = path.posix.join('uploads', 'evidence', storedFilename);
    const insertEvidenceQuery = `
      INSERT INTO Evidence (answerid, filename, originalname, filetype, storagepath, uploaderid)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING evidenceid, uploaddate
    `;

    const evidenceResult = await pool.query(insertEvidenceQuery, [
      answerIdToUse,
      storedFilename,
      file.originalname,
      file.mimetype,
      relativePath,
      userId
    ]);

    const evidenceRow = evidenceResult.rows[0];
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/evidence/${storedFilename}`;

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: {
        id: evidenceRow.evidenceid,
        answerId: answerIdToUse,
        assessmentId: assessmentIdNum,
        questionId: questionIdNum,
        filename: file.originalname,
        storedFilename,
        mimeType: file.mimetype,
        path: relativePath,
        url: publicUrl,
        uploadedAt: evidenceRow.uploaddate
      }
    });

  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading evidence file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// List all evidence files for an assessment (optionally filtered by question)
export const getEvidenceForAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    const { questionId } = req.query;
    const userId = req.user?.userID;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized: missing user context' });
      return;
    }

    const assessmentIdNum = Number(assessmentId);
    if (Number.isNaN(assessmentIdNum)) {
      res.status(400).json({ success: false, message: 'assessmentId must be a valid number' });
      return;
    }

    await ensureEvidenceTable();

    const assessmentQuery = `SELECT assessmentid, companyid FROM Assessment WHERE assessmentid = $1`;
    const assessmentResult = await pool.query(assessmentQuery, [assessmentIdNum]);

    if (assessmentResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    const assessmentCompanyId = assessmentResult.rows[0].companyid;

    if (userRole !== 'admin' && userRole !== 'auditor') {
      const companyLookup = await pool.query('SELECT companyid FROM Company WHERE userid = $1', [userId]);
      const userCompanyId = companyLookup.rows[0]?.companyid;
      if (!userCompanyId || userCompanyId !== assessmentCompanyId) {
        res.status(403).json({ success: false, message: 'Access denied for this assessment' });
        return;
      }
    }

    const params: Array<number> = [assessmentIdNum];
    let whereClause = 'ans.assessmentid = $1';

    if (questionId !== undefined) {
      const questionIdNum = Number(questionId);
      if (Number.isNaN(questionIdNum)) {
        res.status(400).json({ success: false, message: 'questionId must be a valid number' });
        return;
      }
      params.push(questionIdNum);
      whereClause += ' AND ans.questionid = $2';
    }

    const evidenceQuery = `
      SELECT 
        e.evidenceid,
        e.answerid,
        e.filename,
        e.originalname,
        e.filetype,
        e.storagepath,
        e.uploaddate,
        ans.questionid
      FROM Evidence e
      JOIN Answer ans ON e.answerid = ans.answerid
      WHERE ${whereClause}
      ORDER BY e.uploaddate DESC
    `;

    const evidenceResult = await pool.query(evidenceQuery, params);

    const evidence = evidenceResult.rows.map((row: any) => {
      const storedFilename = row.filename || path.basename(row.storagepath || '');
      const relativePathRaw = row.storagepath || path.posix.join('uploads', 'evidence', storedFilename);
      const relativePath = relativePathRaw.replace(/\\/g, '/');
      const publicUrl = `${req.protocol}://${req.get('host')}/uploads/evidence/${storedFilename}`;

      return {
        id: row.evidenceid,
        answerId: row.answerid,
        questionId: row.questionid,
        filename: row.originalname || storedFilename,
        storedFilename,
        mimeType: row.filetype,
        path: relativePath,
        url: publicUrl,
        uploadedAt: row.uploaddate
      };
    });

    const byQuestion = evidence.reduce((acc: Record<number, any[]>, item) => {
      const key = item.questionId;
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {} as Record<number, any[]>);

    res.status(200).json({
      success: true,
      message: 'Evidence fetched successfully',
      data: {
        evidence,
        byQuestion
      }
    });

  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching evidence',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a specific evidence file for an assessment
export const deleteEvidence = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assessmentId, evidenceId } = req.params;
    const userId = req.user?.userID;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized: missing user context' });
      return;
    }

    const assessmentIdNum = Number(assessmentId);
    const evidenceIdNum = Number(evidenceId);

    if (Number.isNaN(assessmentIdNum) || Number.isNaN(evidenceIdNum)) {
      res.status(400).json({ success: false, message: 'assessmentId and evidenceId must be valid numbers' });
      return;
    }

    await ensureEvidenceTable();

    const evidenceQuery = `
      SELECT 
        e.evidenceid,
        e.storagepath,
        e.filename,
        ans.answerid,
        ans.questionid,
        ans.assessmentid,
        a.companyid
      FROM Evidence e
      JOIN Answer ans ON e.answerid = ans.answerid
      JOIN Assessment a ON ans.assessmentid = a.assessmentid
      WHERE e.evidenceid = $1 AND ans.assessmentid = $2
    `;

    const evidenceResult = await pool.query(evidenceQuery, [evidenceIdNum, assessmentIdNum]);

    if (evidenceResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Evidence not found for this assessment' });
      return;
    }

    const evidenceRow = evidenceResult.rows[0];

    if (userRole !== 'admin' && userRole !== 'auditor') {
      const companyLookup = await pool.query('SELECT companyid FROM Company WHERE userid = $1', [userId]);
      const userCompanyId = companyLookup.rows[0]?.companyid;
      if (!userCompanyId || userCompanyId !== evidenceRow.companyid) {
        res.status(403).json({ success: false, message: 'Access denied for this evidence' });
        return;
      }
    }

    const storedFilename = evidenceRow.filename || path.basename(evidenceRow.storagepath || '');
    const relativePathRaw = evidenceRow.storagepath || path.posix.join('uploads', 'evidence', storedFilename);
    const normalizedRelativePath = relativePathRaw.replace(/\\/g, '/');
    const absolutePath = path.isAbsolute(normalizedRelativePath)
      ? normalizedRelativePath
      : path.resolve(process.cwd(), normalizedRelativePath);

    await pool.query('DELETE FROM Evidence WHERE evidenceid = $1', [evidenceIdNum]);

    try {
      await fs.unlink(absolutePath);
    } catch (unlinkError) {
      // Ignore missing file errors to avoid blocking the API
      if ((unlinkError as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('Warning: could not delete evidence file from disk', unlinkError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Evidence deleted successfully',
      data: {
        evidenceId: evidenceIdNum,
        questionId: evidenceRow.questionid,
        answerId: evidenceRow.answerid
      }
    });

  } catch (error) {
    console.error('Error deleting evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting evidence',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update current position when user navigates (without saving answer)
export const updateCurrentPosition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionnaireId } = req.params;
    const { currentQuestionIndex } = req.body;
    const userId = req.user?.userID;

    console.log('🚶 updateCurrentPosition:', { questionnaireId, currentQuestionIndex, userId });

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!questionnaireId) {
      res.status(400).json({
        success: false,
        message: 'Questionnaire ID is required'
      });
      return;
    }

    if (currentQuestionIndex === undefined || currentQuestionIndex === null) {
      res.status(400).json({
        success: false,
        message: 'Current question index is required'
      });
      return;
    }

    // For now, just return success since we don't need to track position in database
    // The position is calculated from answered questions when resuming
    console.log('✅ Position update acknowledged (no database update needed)');

    res.status(200).json({
      success: true,
      message: 'Position updated',
      data: {
        questionnaireId: parseInt(questionnaireId),
        currentQuestionIndex
      }
    });

  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating position',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all assessments with progress (for admin/auditor dashboard)
export const getAllAssessmentsWithProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    console.log('🔍 getAllAssessmentsWithProgress called by user:', user);
    
    if (!user || (user.role !== 'admin' && user.role !== 'auditor')) {
      console.log('❌ Access denied for user:', user?.role);
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Get all assessments with progress from database
    const assessmentsQuery = `
      SELECT 
        a.assessmentid,
        a.questionnaireid,
        a.status,
        a.startdate,
        a.completiondate,
        a.finalscore,
        c.companyname,
        c.companyid,
        u.username,
        u.userid,
        COUNT(ans.answerid) as answered_count,
        (SELECT COUNT(*) FROM Question WHERE questionnaireid = a.questionnaireid) as total_count
      FROM Assessment a
      LEFT JOIN Company c ON a.companyid = c.companyid
      LEFT JOIN "User" u ON c.userid = u.userid
      LEFT JOIN Answer ans ON a.assessmentid = ans.assessmentid
      GROUP BY a.assessmentid, c.companyname, c.companyid, u.username, u.userid
      ORDER BY a.startdate DESC
    `;
    
    const result = await pool.query(assessmentsQuery);
    
    console.log('📊 Retrieved assessments from database:', result.rows.length);

    // Map database results to frontend format
    const assessmentsData = result.rows.map((row: any) => {
      const answeredCount = parseInt(row.answered_count) || 0;
      const totalQuestions = parseInt(row.total_count) || 24; // Default to 24 if no questions found
      
      const progressPercentage = totalQuestions > 0 
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;
      
      return {
        assessmentId: row.assessmentid,
        questionnaireId: row.questionnaireid,
        questionnaireTitle: `Mining Assessment Questionnaire ${row.questionnaireid}`,
        entityName: row.companyname || `Company ${row.companyid}`,
        entityType: 'user',
        status: row.status,
        startDate: row.startdate,
        completionDate: row.completiondate,
        progressPercentage,
        answeredQuestions: answeredCount,
        totalQuestions,
        finalScore: row.finalscore,
        username: row.username
      };
    });

    // Calculate statistics
    const stats = {
      total: assessmentsData.length,
      in_progress: assessmentsData.filter((a: any) => a.status === 'in_progress').length,
      completed: assessmentsData.filter((a: any) => a.status === 'completed').length,
      averageProgress: assessmentsData.length > 0
        ? Math.round(assessmentsData.reduce((sum: number, a: any) => sum + a.progressPercentage, 0) / assessmentsData.length)
        : 0
    };

    console.log('✅ Sending response with assessments:', assessmentsData.length, 'items');
    console.log('📊 Stats:', stats);

    res.status(200).json({
      success: true,
      data: assessmentsData,
      stats,
      total: assessmentsData.length
    });

  } catch (error) {
    console.error('Error getting assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user's current assessment progress and next question
export const getCurrentAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionnaireId } = req.params;
    const userId = req.user?.userID;

    console.log('🔍 getCurrentAssessment called:', { questionnaireId, userId });

    if (!userId || !questionnaireId) {
      res.status(400).json({
        success: false,
        message: 'Missing required data'
      });
      return;
    }

    // Get user's company information
    const userCompanyQuery = `
      SELECT c.companyid, c.companyname
      FROM Company c
      WHERE c.userid = $1
    `;
    
    const userCompanyResult = await pool.query(userCompanyQuery, [userId]);
    
    if (userCompanyResult.rows.length === 0) {
      console.log('❌ No company found for user:', userId);
      res.status(404).json({
        success: false,
        message: 'No company associated with this user'
      });
      return;
    }
    
    const companyId = userCompanyResult.rows[0].companyid;

    // Find assessment for this company and questionnaire
    const assessmentQuery = `
      SELECT a.* FROM Assessment a
      WHERE a.companyid = $1 AND a.questionnaireid = $2
    `;
    
    const assessmentResult = await pool.query(assessmentQuery, [companyId, parseInt(questionnaireId)]);

    if (assessmentResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
      return;
    }

    const assessment = assessmentResult.rows[0];
    
    // Get answered questions from database
    const answeredQuery = `
      SELECT questionid, response FROM Answer 
      WHERE assessmentid = $1
      ORDER BY questionid
    `;
    const answeredResult = await pool.query(answeredQuery, [assessment.assessmentid]);
    const answeredQuestions = answeredResult.rows.map((row: any) => row.questionid);
    const answerMap = answeredResult.rows.reduce((acc: Record<number, string>, row: any) => {
      acc[row.questionid] = row.response ?? '';
      return acc;
    }, {} as Record<number, string>);
    
    console.log('📋 Answered questions from database:', answeredQuestions);
    console.log('🗃️ Answer map:', answerMap);
    
    // Get all questions for this questionnaire
    const questionsQuery = `
      SELECT questionid FROM Question 
      WHERE questionnaireid = $1
      ORDER BY questionid
    `;
    const questionsResult = await pool.query(questionsQuery, [parseInt(questionnaireId)]);
    const allQuestions = questionsResult.rows.map((row: any) => row.questionid);
    
    console.log('📝 All questions for questionnaire:', allQuestions);
    
    const totalQuestions = allQuestions.length;

    const progressPercentage = totalQuestions > 0 
      ? Math.round((answeredQuestions.length / totalQuestions) * 100 * 100) / 100
      : 0;

    // Find the first unanswered question
    let nextQuestionId = null;
    let nextQuestionIndex = 0;
    
    for (let i = 0; i < allQuestions.length; i++) {
      const questionId = allQuestions[i];
      if (!answeredQuestions.includes(questionId)) {
        nextQuestionId = questionId;
        nextQuestionIndex = i; // 0-based index for frontend
        break;
      }
    }
    
    // If all questions answered, go to the last question
    if (nextQuestionId === null && allQuestions.length > 0) {
      nextQuestionId = allQuestions[allQuestions.length - 1];
      nextQuestionIndex = allQuestions.length - 1;
    }
    
    console.log('🎯 Resume logic result:', {
      nextQuestionId,
      nextQuestionIndex,
      answeredQuestionsCount: answeredQuestions.length,
      totalQuestions,
      allAnsweredQuestions: answeredQuestions
    });

    console.log('📊 getCurrentAssessment result:', {
      assessmentId: assessment.assessmentid,
      userId,
      companyId,
      answeredQuestions,
      answeredCount: answeredQuestions.length,
      totalQuestions,
      progressPercentage,
      nextQuestionIndex,
      nextQuestionId,
      answerMap
    });

    res.status(200).json({
      success: true,
      data: {
        id: assessment.assessmentid,
        questionnaireId: assessment.questionnaireid,
        answeredQuestions,
        answers: answerMap,
        totalQuestions,
        progressPercentage,
        status: assessment.status,
        started_at: assessment.startdate,
        nextQuestionIndex, // Return next unanswered question index (0-based)
        nextQuestionId    // Return next unanswered question ID
      }
    });

  } catch (error) {
    console.error('Error getting current assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user's assessments
export const getMyAssessments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userID;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized: missing user context' });
      return;
    }

    // Derive companyId from userId (token does not include companyid)
    const companyLookupQuery = `
      SELECT c.companyid
      FROM Company c
      WHERE c.userid = $1
      LIMIT 1
    `;
    const companyLookupResult = await pool.query(companyLookupQuery, [userId]);
    if (companyLookupResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No company associated with this user' });
      return;
    }
    const companyId = companyLookupResult.rows[0].companyid;

    // Get assessments for this company
    const assessmentsQuery = `
      SELECT 
        a.assessmentid,
        a.questionnaireid,
        a.status,
        a.startdate,
        a.completiondate,
        a.finalscore,
        q.title AS questionnaire_title,
        q.description AS questionnaire_description,
        COUNT(ans.answerid) AS answered_count,
        (SELECT COUNT(*) FROM Question WHERE questionnaireid = a.questionnaireid) AS total_count
      FROM Assessment a
      LEFT JOIN Answer ans ON a.assessmentid = ans.assessmentid
      LEFT JOIN Questionnaire q ON a.questionnaireid = q.questionnaireid
      WHERE a.companyid = $1
      GROUP BY 
        a.assessmentid,
        a.questionnaireid,
        a.status,
        a.startdate,
        a.completiondate,
        a.finalscore,
        q.title,
        q.description
      ORDER BY COALESCE(a.completiondate, a.startdate) DESC
    `;

    const result = await pool.query(assessmentsQuery, [companyId]);
    
    const assessmentsData = result.rows.map((row: any) => {
      const answeredCount = parseInt(row.answered_count) || 0;
      const totalQuestions = parseInt(row.total_count) || 24;
      
      const progressPercentage = totalQuestions > 0 
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;
      
      console.log(`🔍 getMyAssessments - Assessment ${row.assessmentid} finalscore:`, row.finalscore, 'Type:', typeof row.finalscore);
      
      return {
        id: row.assessmentid,
        questionnaireId: row.questionnaireid,
        questionnaireTitle: row.questionnaire_title || `Mining Assessment Questionnaire ${row.questionnaireid}`,
        questionnaireDescription: row.questionnaire_description,
        status: row.status,
        startDate: row.startdate,
        completionDate: row.completiondate,
        progressPercentage,
        answeredQuestions: answeredCount,
        totalQuestions,
        finalScore: row.finalscore !== null ? parseFloat(row.finalscore) : null
      };
    });

    console.log('📤 getMyAssessments sending:', assessmentsData.map((a: any) => ({ id: a.id, finalScore: a.finalScore })));

    res.status(200).json({
      success: true,
      data: assessmentsData
    });

  } catch (error) {
    console.error('Error getting user assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get completed assessment results for the current user (used by results page)
export const getMyAssessmentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userID;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized: missing user context' });
      return;
    }

    const companyLookupQuery = `
      SELECT c.companyid
      FROM Company c
      WHERE c.userid = $1
      LIMIT 1
    `;
    const companyLookupResult = await pool.query(companyLookupQuery, [userId]);
    if (companyLookupResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No company associated with this user' });
      return;
    }
    const companyId = companyLookupResult.rows[0].companyid;

    const resultsQuery = `
      SELECT
        a.assessmentid,
        a.questionnaireid,
        a.status,
        a.startdate,
        a.completiondate,
        a.finalscore,
        q.title AS questionnaire_title,
        q.description AS questionnaire_description,
        COUNT(ans.answerid) AS answered_count,
        (SELECT COUNT(*) FROM Question WHERE questionnaireid = a.questionnaireid) AS total_count
      FROM Assessment a
      LEFT JOIN Answer ans ON a.assessmentid = ans.assessmentid
      LEFT JOIN Questionnaire q ON a.questionnaireid = q.questionnaireid
      WHERE a.companyid = $1 AND a.status = 'completed'
      GROUP BY
        a.assessmentid,
        a.questionnaireid,
        a.status,
        a.startdate,
        a.completiondate,
        a.finalscore,
        q.title,
        q.description
      ORDER BY COALESCE(a.completiondate, a.startdate) DESC
    `;

    const result = await pool.query(resultsQuery, [companyId]);

    const resultsData = result.rows.map((row: any) => {
      const answeredCount = parseInt(row.answered_count) || 0;
      const totalQuestions = parseInt(row.total_count) || 0;

      const progressPercentage = totalQuestions > 0
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;

      // Log the raw finalscore from DB to debug
      console.log(`🔍 Assessment ${row.assessmentid} - Raw finalscore from DB:`, row.finalscore, 'Type:', typeof row.finalscore);

      return {
        id: row.assessmentid,
        assessmentId: row.assessmentid,
        questionnaireId: row.questionnaireid,
        questionnaireTitle: row.questionnaire_title || `Mining Assessment Questionnaire ${row.questionnaireid}`,
        questionnaireDescription: row.questionnaire_description,
        status: row.status,
        startDate: row.startdate,
        completionDate: row.completiondate,
        progressPercentage,
        answeredQuestions: answeredCount,
        totalQuestions,
        finalScore: row.finalscore !== null ? parseFloat(row.finalscore) : null,
        completedAt: row.completiondate
      };
    });

    console.log('📤 Sending getMyAssessmentResults response with', resultsData.length, 'assessments');
    console.log('📊 Scores being sent:', resultsData.map((a: any) => ({ id: a.id, finalScore: a.finalScore })));

    res.status(200).json({
      success: true,
      data: resultsData
    });

  } catch (error) {
    console.error('Error getting assessment results list:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment results',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get detailed assessment with all questions and answers
export const getAssessmentDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user?.userID;
    const userRole = req.user?.role;

    console.log('🔍 getAssessmentDetail called:', { assessmentId, userId, userRole });

      if (!userId || !assessmentId) {
        console.log('❌ Missing required data:', { userId, assessmentId });
        res.status(400).json({
          success: false,
          message: 'Missing required data'
        });
        return;
      }

      // Get assessment details (admins/auditors can view any assessment)
      const assessmentQuery = `
        SELECT 
          a.assessmentid,
          a.questionnaireid,
          a.companyid,
          a.status,
          a.startdate,
          a.completiondate,
          a.finalscore,
          a.aianalysis,
          a.reviewernotes,
          a.questionreviewernotes,
          c.companyname,
          q.title as questionnaire_title,
          q.description as questionnaire_description
        FROM Assessment a
        LEFT JOIN Company c ON a.companyid = c.companyid
        LEFT JOIN Questionnaire q ON a.questionnaireid = q.questionnaireid
        WHERE a.assessmentid = $1
      `;
    
      const assessmentResult = await pool.query(assessmentQuery, [parseInt(assessmentId)]);

      console.log('📊 Assessment query result:', assessmentResult.rows.length, 'rows');

      if (assessmentResult.rows.length === 0) {
        console.log('❌ Assessment not found for ID:', assessmentId);
        res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
        return;
      }

      const assessment = assessmentResult.rows[0];
      console.log('✅ Assessment found:', { 
        assessmentId: assessment.assessmentid, 
        companyName: assessment.companyname,
        questionnaireId: assessment.questionnaireid
      });

      // If user is not admin/auditor, verify they own this assessment
      if (userRole !== 'admin' && userRole !== 'auditor') {
        const userCompanyQuery = `SELECT companyid FROM Company WHERE userid = $1`;
        const userCompanyResult = await pool.query(userCompanyQuery, [userId]);
        
        if (userCompanyResult.rows.length === 0 || 
            userCompanyResult.rows[0].companyid !== assessment.companyid) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }

      // Get all questions and answers for this assessment
      const questionsQuery = `
        SELECT 
          q.questionid,
          q.text as questiontext,
          q.category,
          q.type as questiontype,
          q.options,
          q.weight,
          q.require_evidence as evidencerequired,
          a.answerid,
          a.response
        FROM Question q
        LEFT JOIN Answer a ON q.questionid = a.questionid AND a.assessmentid = $1
        WHERE q.questionnaireid = $2
        ORDER BY q.questionid
      `;
    
      const questionsResult = await pool.query(questionsQuery, [
        parseInt(assessmentId),
        assessment.questionnaireid
      ]);

      console.log('📝 Questions query result:', questionsResult.rows.length, 'questions');

      // Group questions by category
      const questionsByCategory: Record<string, any[]> = {};
      let totalAnswered = 0;

      questionsResult.rows.forEach((row: any) => {
        const category = row.category || 'General';
      
        if (!questionsByCategory[category]) {
          questionsByCategory[category] = [];
        }

        questionsByCategory[category].push({
          questionId: row.questionid,
          questionText: row.questiontext,
          questionType: row.questiontype,
          options: row.options,
          weight: row.weight,
          evidenceRequired: row.evidencerequired,
          answer: row.response,
          answered: !!row.answerid
        });

        if (row.answerid) {
          totalAnswered++;
        }
      });

      // Calculate progress
      const totalQuestions = questionsResult.rows.length;
      const progressPercentage = totalQuestions > 0 
        ? Math.round((totalAnswered / totalQuestions) * 100)
        : 0;

      console.log('✅ Sending response with', Object.keys(questionsByCategory).length, 'categories,', totalQuestions, 'questions,', totalAnswered, 'answered');
      console.log('📊 AI Analysis status:', {
        hasAiAnalysis: !!assessment.aianalysis,
        analysisLength: assessment.aianalysis?.length || 0,
        analysisPreview: assessment.aianalysis?.substring(0, 100)
      });

      res.status(200).json({
        success: true,
        data: {
          assessmentId: assessment.assessmentid,
          questionnaireId: assessment.questionnaireid,
          questionnaireTitle: assessment.questionnaire_title || `Assessment ${assessment.questionnaireid}`,
          questionnaireDescription: assessment.questionnaire_description,
          companyName: assessment.companyname,
          status: assessment.status,
          startDate: assessment.startdate,
          completionDate: assessment.completiondate,
          finalScore: assessment.finalscore,
          aiAnalysis: assessment.aianalysis || null,
          reviewerNotes: assessment.reviewernotes || null,
          questionReviewerNotes: assessment.questionreviewernotes || null,
          progressPercentage,
          totalQuestions,
          answeredQuestions: totalAnswered,
          questionsByCategory
        }
      });

    } catch (error) {
      console.error('Error getting assessment detail:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving assessment detail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

// Get summarized assessment results (aggregated per category, no per-question list)
export const getAssessmentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user?.userID;

    if (!userId || !assessmentId) {
      res.status(400).json({ success: false, message: 'Missing required data' });
      return;
    }

    // Resolve company from user
    const companyQuery = `SELECT companyid FROM Company WHERE userid = $1 LIMIT 1`;
    const companyResult = await pool.query(companyQuery, [userId]);
    if (companyResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No company associated with user' });
      return;
    }
    const companyId = companyResult.rows[0].companyid;

    // Fetch assessment ensuring ownership
    const assessmentQuery = `
      SELECT a.assessmentid, a.questionnaireid, a.status, a.startdate, a.completiondate, a.finalscore,
             q.title AS questionnaire_title, q.description AS questionnaire_description
      FROM Assessment a
      LEFT JOIN Questionnaire q ON a.questionnaireid = q.questionnaireid
      WHERE a.assessmentid = $1 AND a.companyid = $2
    `;
    const assessmentRes = await pool.query(assessmentQuery, [parseInt(assessmentId), companyId]);
    if (assessmentRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Assessment not found or access denied' });
      return;
    }
    const assessment = assessmentRes.rows[0];

    // Pull question + answer info for aggregation
    const qaQuery = `
      SELECT q.questionid, q.category, q.weight, a.answerid, a.score
      FROM Question q
      LEFT JOIN Answer a ON q.questionid = a.questionid AND a.assessmentid = $1
      WHERE q.questionnaireid = $2
      ORDER BY q.questionid
    `;
    const qaResult = await pool.query(qaQuery, [parseInt(assessmentId), assessment.questionnaireid]);

    interface CategoryAgg { total: number; answered: number; score: number; maxScore: number; }
    const categoryMap: Record<string, CategoryAgg> = {};
    let totalAnswered = 0;
    let totalQuestions = 0;
    let accumulatedScore = 0;
    let accumulatedMaxScore = 0;

    qaResult.rows.forEach((row: any) => {
      const category = row.category || 'General';
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, answered: 0, score: 0, maxScore: 0 };
      }
      categoryMap[category].total += 1;
      totalQuestions += 1;
      const weight = parseInt(row.weight) || 10;
      categoryMap[category].maxScore += weight;
      accumulatedMaxScore += weight;
      if (row.answerid) {
        categoryMap[category].answered += 1;
        totalAnswered += 1;
        if (row.score !== null) {
          const s = parseFloat(row.score);
          categoryMap[category].score += s;
          accumulatedScore += s;
        }
      }
    });

    const progressPercentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
    const calculatedScore = accumulatedMaxScore > 0 ? Math.round((accumulatedScore / accumulatedMaxScore) * 100) : 0;

    const categories = Object.entries(categoryMap).map(([name, agg]) => ({
      name,
      totalQuestions: agg.total,
      answeredQuestions: agg.answered,
      progressPercentage: agg.total > 0 ? Math.round((agg.answered / agg.total) * 100) : 0,
      calculatedScore: agg.maxScore > 0 ? Math.round((agg.score / agg.maxScore) * 100) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        assessmentId: assessment.assessmentid,
        questionnaireId: assessment.questionnaireid,
        questionnaireTitle: assessment.questionnaire_title || `Assessment ${assessment.questionnaireid}`,
        questionnaireDescription: assessment.questionnaire_description,
        status: assessment.status,
        startDate: assessment.startdate,
        completionDate: assessment.completiondate,
        finalScore: assessment.finalscore, // Stored final score if available
        calculatedScore,
        progressPercentage,
        totalQuestions,
        answeredQuestions: totalAnswered,
        categories
      }
    });
  } catch (error) {
    console.error('Error getting assessment results:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment results',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Complete assessment - marks as completed and calculates final score
export const completeAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionnaireId } = req.body;
    const userId = req.user?.userID;

    console.log('🏁 Completing assessment - Request details:', { 
      questionnaireId, 
      userId,
      body: req.body,
      user: req.user
    });

    if (!questionnaireId || !userId) {
      console.log('❌ Missing required data:', { questionnaireId, userId });
      res.status(400).json({
        success: false,
        message: 'Missing required data'
      });
      return;
    }

    // Get user's company
    const companyQuery = 'SELECT companyid FROM Company WHERE userid = $1';
    const companyResult = await pool.query(companyQuery, [userId]);

    console.log('🏢 Company query result:', companyResult.rows);

    if (companyResult.rows.length === 0) {
      console.log('❌ No company found for user:', userId);
      res.status(404).json({
        success: false,
        message: 'No company found for user'
      });
      return;
    }

    const companyId = companyResult.rows[0].companyid;
    console.log('✅ Found company:', companyId);

    // Get the assessment
    const assessmentQuery = `
      SELECT a.* 
      FROM Assessment a 
      WHERE a.companyid = $1 AND a.questionnaireid = $2
    `;
    const assessmentResult = await pool.query(assessmentQuery, [companyId, questionnaireId]);

    console.log('📋 Assessment query result:', assessmentResult.rows);

    if (assessmentResult.rows.length === 0) {
      console.log('❌ Assessment not found for:', { companyId, questionnaireId });
      res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
      return;
    }

    const assessment = assessmentResult.rows[0];
    const assessmentId = assessment.assessmentid;
    console.log('✅ Found assessment:', assessmentId);

    // Calculate final score based on all answers
    const scoreQuery = `
      SELECT 
      COUNT(DISTINCT a.answerid) as answered_count,
      COUNT(DISTINCT q.questionid) as total_count,
      COALESCE(SUM(
        CASE 
        WHEN a.response IS NOT NULL THEN
          -- Score based on option chosen
          CASE 
          WHEN a.response = 'option_a' THEN (q.weight * 0.0)   -- 0%
          WHEN a.response = 'option_b' THEN (q.weight * 0.25)  -- 25%
          WHEN a.response = 'option_c' THEN (q.weight * 0.5)   -- 50%
          WHEN a.response = 'option_d' THEN (q.weight * 0.75)  -- 75%
          WHEN a.response = 'option_e' THEN (q.weight * 1.0)   -- 100%
          ELSE 0 -- Default if response doesn't match expected format
          END
        ELSE 0
        END
      ), 0) as total_score,
      COALESCE(SUM(q.weight), 0) as max_score
      FROM Question q
      LEFT JOIN Answer a ON q.questionid = a.questionid AND a.assessmentid = $1
      WHERE q.questionnaireid = $2
    `;

    console.log('📊 Running score query with:', { assessmentId, questionnaireId });
    const scoreResult = await pool.query(scoreQuery, [assessmentId, questionnaireId]);
    const scoreData = scoreResult.rows[0];

    console.log('📊 Raw score data:', scoreData);

    const answeredCount = parseInt(scoreData.answered_count);
    const totalCount = parseInt(scoreData.total_count);
    const totalScore = parseFloat(scoreData.total_score);
    const maxScore = parseFloat(scoreData.max_score);

    console.log('📊 Score calculation:', {
      answeredCount,
      totalCount,
      totalScore,
      maxScore
    });

    // Check if all questions are answered
    if (answeredCount < totalCount) {
      console.log('⚠️ Not all questions answered');
      res.status(400).json({
      success: false,
      message: `Please answer all questions. ${answeredCount}/${totalCount} answered.`
      });
      return;
    }

    // Calculate final score as percentage
    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    console.log('🎯 Final score calculated:', finalScore);

    // Update assessment status with initial calculated score
    // (AI scoring will update this if successful)
    const updateQuery = `
      UPDATE Assessment 
      SET 
      status = 'completed',
      finalscore = $1,
      completiondate = NOW()
      WHERE assessmentid = $2
      RETURNING *
    `;

    console.log('💾 Updating assessment with initial score:', { finalScore, assessmentId });
    const updateResult = await pool.query(updateQuery, [finalScore, assessmentId]);
    let updatedAssessment = updateResult.rows[0];

    console.log('✅ Assessment marked as completed:', {
      assessmentId,
      initialScore: finalScore,
      status: 'completed'
    });

    // Trigger AI scoring - this will overwrite the finalscore if successful
    console.log('🤖 Triggering AI scoring...');
    
    try {
      const aiScoringModule = await import('../ai_service/ai_scoring.js');
      console.log('📦 AI scoring module imported successfully');
      
      const aiScoreResult = await aiScoringModule.getAIScoreForAssessment(assessmentId);
      console.log('🎯 AI scoring result:', aiScoreResult);
      
      if (aiScoreResult.success && aiScoreResult.score !== undefined) {
        console.log('✅ AI scoring completed successfully, score:', aiScoreResult.score);
        
        // Fetch the updated assessment with AI score
        const refreshQuery = `SELECT * FROM Assessment WHERE assessmentid = $1`;
        const refreshResult = await pool.query(refreshQuery, [assessmentId]);
        updatedAssessment = refreshResult.rows[0];
        
        console.log('✅ Assessment updated with AI score:', updatedAssessment.finalscore);
      } else {
        console.warn('⚠️ AI scoring failed, keeping calculated score:', aiScoreResult.error);
      }
    } catch (scoringError) {
      console.error('❌ Error during AI scoring:', scoringError);
      console.error('Stack trace:', scoringError instanceof Error ? scoringError.stack : 'No stack');
      // Continue with calculated score if AI scoring fails
    }

    console.log('📤 Sending response with final score:', updatedAssessment.finalscore);

    res.status(200).json({
      success: true,
      message: 'Assessment completed successfully!',
      data: {
      assessmentId: updatedAssessment.assessmentid,
      questionnaireId: updatedAssessment.questionnaireid,
      status: updatedAssessment.status,
      finalScore: updatedAssessment.finalscore,
      completionDate: updatedAssessment.completiondate,
      answeredQuestions: answeredCount,
      totalQuestions: totalCount
      }
    });

  } catch (error) {
    console.error('❌ Error completing assessment:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      message: 'Error completing assessment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Score assessment using AI Engine
export const scoreAssessmentController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assessmentId } = req.body;
    const userId = req.user?.userID;

    if (!assessmentId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Missing required data: assessmentId'
      });
      return;
    }

    // Verify user owns this assessment
    const verifyQuery = `
      SELECT a.assessmentid, a.status, a.finalscore
      FROM Assessment a
      JOIN Company c ON a.companyid = c.companyid
      WHERE a.assessmentid = $1 AND c.userid = $2
    `;

    const verifyResult = await pool.query(verifyQuery, [assessmentId, userId]);
    
    if (verifyResult.rows.length === 0) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access to assessment'
      });
      return;
    }

    const assessment = verifyResult.rows[0];

    // Check if assessment is completed
    if (assessment.status !== 'completed') {
      res.status(400).json({
        success: false,
        message: 'Assessment must be completed before scoring'
      });
      return;
    }

    // Check if already scored
    if (assessment.finalscore !== null) {
      res.status(400).json({
        success: false,
        message: 'Assessment has already been scored',
        currentScore: assessment.finalscore
      });
      return;
    }

    // Import and use AI scoring service
    const aiScoringModule = await import('../ai_service/ai_scoring.js');
    const scoreResult = await aiScoringModule.scoreAssessment(assessmentId);

    if (!scoreResult.success) {
      res.status(500).json({
        success: false,
        message: 'Failed to score assessment',
        error: scoreResult.error
      });
      return;
    }

    res.json({
      success: true,
      message: 'Assessment scored successfully',
      scoring: scoreResult.scoring
    });

  } catch (error) {
    console.error('Error in scoreAssessmentController:', error);
    res.status(500).json({
      success: false,
      message: 'Error scoring assessment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get assessment scoring result
export const getAssessmentScoringResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user?.userID;
    const userRole = req.user?.role;

    if (!assessmentId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Missing required data: assessmentId'
      });
      return;
    }

    // Verify user owns this assessment OR is admin/auditor
    let verifyQuery: string;
    let queryParams: any[];

    if (userRole === 'admin' || userRole === 'auditor') {
      // Admin/Auditor can view any assessment
      verifyQuery = `
        SELECT 
          a.assessmentid,
          a.finalscore,
          a.scoringdetails,
          a.status,
          a.completiondate,
          c.companyname,
          q.questionnairename
        FROM Assessment a
        JOIN Company c ON a.companyid = c.companyid
        JOIN Questionnaire q ON a.questionnaireid = q.questionnaireid
        WHERE a.assessmentid = $1
      `;
      queryParams = [assessmentId];
    } else {
      // Regular user can only view their own assessment
      verifyQuery = `
        SELECT 
          a.assessmentid,
          a.finalscore,
          a.scoringdetails,
          a.status,
          a.completiondate,
          c.companyname,
          q.questionnairename
        FROM Assessment a
        JOIN Company c ON a.companyid = c.companyid
        JOIN Questionnaire q ON a.questionnaireid = q.questionnaireid
        WHERE a.assessmentid = $1 AND c.userid = $2
      `;
      queryParams = [assessmentId, userId];
    }

    const verifyResult = await pool.query(verifyQuery, queryParams);
    
    if (verifyResult.rows.length === 0) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access to assessment'
      });
      return;
    }

    const assessment = verifyResult.rows[0];

    if (!assessment.scoringdetails) {
      res.status(404).json({
        success: false,
        message: 'Assessment has not been scored yet'
      });
      return;
    }

    res.json({
      success: true,
      assessment: {
        assessmentid: assessment.assessmentid,
        companyname: assessment.companyname,
        questionnairename: assessment.questionnairename,
        finalscore: assessment.finalscore,
        status: assessment.status,
        completiondate: assessment.completiondate,
        scoring: JSON.parse(assessment.scoringdetails)
      }
    });

  } catch (error) {
    console.error('Error in getAssessmentScoringResult:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving scoring result',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Save reviewer notes for an assessment
export const saveReviewerNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    const { reviewerNotes, questionReviewerNotes } = req.body;
    const userId = req.user?.userID;

    if (!userId || !assessmentId) {
      res.status(400).json({
        success: false,
        message: 'Missing required data'
      });
      return;
    }

    // Update reviewer notes (both overall and per-question)
    const updateQuery = `
      UPDATE Assessment
      SET reviewernotes = $1,
          questionreviewernotes = $2
      WHERE assessmentid = $3
      RETURNING assessmentid, reviewernotes, questionreviewernotes
    `;

    const result = await pool.query(updateQuery, [
      reviewerNotes || null, 
      questionReviewerNotes ? JSON.stringify(questionReviewerNotes) : null,
      parseInt(assessmentId)
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reviewer notes saved successfully',
      data: {
        assessmentId: result.rows[0].assessmentid,
        reviewerNotes: result.rows[0].reviewernotes,
        questionReviewerNotes: result.rows[0].questionreviewernotes
      }
    });

  } catch (error) {
    console.error('Error saving reviewer notes:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving reviewer notes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get scoring statistics for a questionnaire
export const getScoringStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionnaireId } = req.params;

    if (!questionnaireId) {
      res.status(400).json({
        success: false,
        message: 'Missing required data: questionnaireId'
      });
      return;
    }

    const aiScoringModule = await import('../ai_service/ai_scoring.js');
    const stats = await aiScoringModule.getScoringStatistics(parseInt(questionnaireId));

    if (!stats) {
      res.status(404).json({
        success: false,
        message: 'No scoring data available'
      });
      return;
    }

    res.json({
      success: true,
      statistics: {
        totalAssessments: parseInt(stats.total_assessments),
        scoredCount: parseInt(stats.scored_count),
        averageScore: stats.average_score ? parseFloat(stats.average_score).toFixed(2) : 0,
        minScore: stats.min_score ? parseFloat(stats.min_score).toFixed(2) : 0,
        maxScore: stats.max_score ? parseFloat(stats.max_score).toFixed(2) : 0,
        stddevScore: stats.stddev_score ? parseFloat(stats.stddev_score).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Error in getScoringStatistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
