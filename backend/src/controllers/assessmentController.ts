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
        finalScore: row.finalscore,
        completedAt: row.completiondate
      };
    });

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

      console.log('🔍 getAssessmentDetail called with:', { assessmentId, userId });

      if (!userId || !assessmentId) {
        console.log('❌ Missing required data:', { userId, assessmentId });
        res.status(400).json({
          success: false,
          message: 'Missing required data'
        });
        return;
      }

      // Get user's company
      const userCompanyQuery = `
        SELECT c.companyid, c.companyname
        FROM Company c
        WHERE c.userid = $1
      `;
    
      const userCompanyResult = await pool.query(userCompanyQuery, [userId]);
      
      console.log('✅ User company result:', userCompanyResult.rows);
    
      if (userCompanyResult.rows.length === 0) {
        console.log('❌ No company found for user:', userId);
        res.status(404).json({
          success: false,
          message: 'No company associated with this user'
        });
        return;
      }
    
      const companyId = userCompanyResult.rows[0].companyid;

      // Get assessment details
      const assessmentQuery = `
        SELECT 
          a.assessmentid,
          a.questionnaireid,
          a.status,
          a.startdate,
          a.completiondate,
          a.finalscore,
          c.companyname,
          q.title as questionnaire_title,
          q.description as questionnaire_description
        FROM Assessment a
        LEFT JOIN Company c ON a.companyid = c.companyid
        LEFT JOIN Questionnaire q ON a.questionnaireid = q.questionnaireid
        WHERE a.assessmentid = $1 AND a.companyid = $2
      `;
    
      const assessmentResult = await pool.query(assessmentQuery, [parseInt(assessmentId), companyId]);

      console.log('✅ Assessment result:', assessmentResult.rows);

      if (assessmentResult.rows.length === 0) {
        console.log('❌ Assessment not found or access denied:', { assessmentId, companyId });
        res.status(404).json({
          success: false,
          message: 'Assessment not found or access denied'
        });
        return;
      }

      const assessment = assessmentResult.rows[0];

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

      console.log('✅ Questions result count:', questionsResult.rows.length);

      // Group questions by category
      const questionsByCategory: Record<string, any[]> = {};
      let totalAnswered = 0;
      let maxScore = 0;

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
      
        maxScore += parseInt(row.weight) || 10;
      });

      // Calculate progress
      const totalQuestions = questionsResult.rows.length;
      const progressPercentage = totalQuestions > 0 
        ? Math.round((totalAnswered / totalQuestions) * 100)
        : 0;

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
              -- For multiple choice, calculate percentage based on response value
              CASE 
                WHEN q.type = 'multiple_choice' THEN 
                  (CAST(a.response AS DECIMAL) * q.weight / 100)
                ELSE 
                  -- For essay, default scoring (can be improved with AI)
                  (q.weight * 0.7)
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

    // Update assessment status and final score
    const updateQuery = `
      UPDATE Assessment 
      SET 
        status = 'completed',
        finalscore = $1,
        completiondate = NOW()
      WHERE assessmentid = $2
      RETURNING *
    `;

    console.log('💾 Updating assessment with:', { finalScore, assessmentId });
    const updateResult = await pool.query(updateQuery, [finalScore, assessmentId]);
    const updatedAssessment = updateResult.rows[0];

    console.log('✅ Assessment completed successfully:', {
      assessmentId,
      finalScore,
      status: 'completed',
      updatedAssessment
    });

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
