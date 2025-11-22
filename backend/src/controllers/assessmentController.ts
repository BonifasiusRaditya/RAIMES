import type { Request, Response } from 'express';
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

    // Find assessment by companyId and questionnaireId
    // assessmentId parameter is actually questionnaireId from frontend
    const questionnaireIdNum = parseInt(assessmentId);
    const assessmentQuery = `
      SELECT a.* FROM Assessment a
      WHERE a.companyid = $1 AND a.questionnaireid = $2
    `;
    
    const assessmentResult = await pool.query(assessmentQuery, [companyId, questionnaireIdNum]);
    
    if (assessmentResult.rows.length === 0) {
      console.log(`❌ Assessment not found for company ${companyId} and questionnaire ${questionnaireIdNum}`);
      res.status(404).json({
        success: false,
        message: `Assessment not found for company ${companyId} and questionnaire ${questionnaireIdNum}`
      });
      return;
    }

    const assessment = assessmentResult.rows[0];
    const questionIdNum = parseInt(questionId);
    
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
    
    // Get current progress counts
    const progressQuery = `
      SELECT 
        COUNT(a.answerid) as answered_count,
        (SELECT COUNT(*) FROM Question WHERE questionnaireid = $2) as total_count
      FROM Answer a
      WHERE a.assessmentid = $1
    `;
    
    const progressResult = await pool.query(progressQuery, [assessment.assessmentid, questionnaireIdNum]);
    const { answered_count, total_count } = progressResult.rows[0];
    
    const answeredCount = parseInt(answered_count);
    const totalQuestions = parseInt(total_count);
    
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
      SELECT questionid FROM Answer 
      WHERE assessmentid = $1
      ORDER BY questionid
    `;
    const answeredResult = await pool.query(answeredQuery, [assessment.assessmentid]);
    const answeredQuestions = answeredResult.rows.map((row: any) => row.questionid);
    
    console.log('📋 Answered questions from database:', answeredQuestions);
    
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
      nextQuestionId
    });

    res.status(200).json({
      success: true,
      data: {
        id: assessment.assessmentid,
        questionnaireId: assessment.questionnaireid,
        answeredQuestions,
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
    const companyId = req.user?.companyid;

    if (!userId || !companyId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Get assessments for this company
    const assessmentsQuery = `
      SELECT 
        a.assessmentid,
        a.questionnaireid,
        a.status,
        a.startdate,
        a.completiondate,
        a.finalscore,
        COUNT(ans.answerid) as answered_count,
        (SELECT COUNT(*) FROM Question WHERE questionnaireid = a.questionnaireid) as total_count
      FROM Assessment a
      LEFT JOIN Answer ans ON a.assessmentid = ans.assessmentid
      WHERE a.companyid = $1
      GROUP BY a.assessmentid
      ORDER BY a.startdate DESC
    `;
    
    const result = await pool.query(assessmentsQuery, [companyId]);
    
    const assessmentsData = result.rows.map((row: any) => {
      const answeredCount = parseInt(row.answered_count) || 0;
      const totalQuestions = parseInt(row.total_count) || 24;
      
      const progressPercentage = totalQuestions > 0 
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;
      
      return {
        id: row.assessmentid,
        questionnaireId: row.questionnaireid,
        questionnaireTitle: `Mining Assessment Questionnaire ${row.questionnaireid}`,
        status: row.status,
        startDate: row.startdate,
        completionDate: row.completiondate,
        progressPercentage,
        answeredQuestions: answeredCount,
        totalQuestions,
        finalScore: row.finalscore
      };
    });

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
