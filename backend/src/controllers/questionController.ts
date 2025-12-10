import type { Request, Response } from 'express';
import pool from '../config/database.js';

interface Question {
  questionID?: number;
  questionnaireID?: number;
  text: string;
  type: 'essay' | 'multiple_choice';
  weight: number;
  category: string;
  require_evidence: boolean;
  options?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

// Test endpoint to check if controller is working
// /api/questions/test
export const testQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        res.json({
            success: true,
            message: 'Question controller is working',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Test endpoint failed'
        });
    }
};

// Test endpoint untuk getAllQuestions tanpa authentication
// /api/questions/public
export const getAllQuestionsPublic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, type, search } = req.query;
      
        let query = `
          SELECT questionID as id, questionnaireid AS "questionnaireID", text, type, weight, category, require_evidence, options, 
                 created_at, updated_at 
          FROM Question 
          WHERE 1=1
        `;
        
        const queryParams: any[] = [];
        let paramCount = 0;

        // Add filters
        if (category && category !== 'all') {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            queryParams.push(category);
        }

        if (type && type !== 'all') {
            paramCount++;
            query += ` AND type = $${paramCount}`;
            queryParams.push(type);
        }

        if (search) {
            paramCount++;
            query += ` AND (text ILIKE $${paramCount} OR category ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, queryParams);
        
        // JSONB options are automatically parsed by pg driver, no need for JSON.parse
        const questions = result.rows;

        res.status(200).json({
            success: true,
            data: questions,
            total: questions.length,
            message: 'Questions retrieved successfully (public endpoint)'
        });
    } catch (error) {
        console.error('Error getting questions (public):', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving questions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// /
export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const { category, type, search } = req.query;
    
    let query = `
      SELECT questionID as id, questionnaireid AS "questionnaireID", text, type, weight, category, require_evidence, options, 
             created_at, updated_at 
      FROM Question 
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramCount = 0;

    // Add filters
    if (category && category !== 'all') {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      queryParams.push(category);
    }

    if (type && type !== 'all') {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      queryParams.push(type);
    }

    if (search) {
      paramCount++;
      query += ` AND (text ILIKE $${paramCount} OR category ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, queryParams);
    
    // JSONB options are automatically parsed by pg driver, no need for JSON.parse
    const questions = result.rows;

    res.status(200).json({
      success: true,
      data: questions,
      total: questions.length
    });
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving questions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT questionID as id, questionnaireid AS "questionnaireID", text, type, weight, category, require_evidence, options, 
              created_at, updated_at 
       FROM Question 
       WHERE questionID = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const question = result.rows[0];
    // JSONB options are automatically parsed by pg driver, no need for JSON.parse

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving question',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    // Accept different casing/keys from frontend: questionnaireID | questionnaireId | questionnaireid
    const rawBody: any = req.body || {};
    const questionnaireID: number | null = rawBody.questionnaireID ?? rawBody.questionnaireId ?? rawBody.questionnaireid ?? null;
    const { text, type, weight, category, require_evidence, options }: any = rawBody;

    // Debug log to help trace payload issues (remove or lower log level in production)
    console.debug('createQuestion payload:', { questionnaireID, text, type, weight, category, require_evidence, options });

    // Require questionnaireID to avoid DB NOT NULL error
    if (questionnaireID == null || questionnaireID <= 0) {
      return res.status(400).json({
        success: false,
        message: 'questionnaireID is required and must be a positive integer'
      });
    }

    // Verify questionnaire exists
    const qCheck = await pool.query('SELECT questionnaireid FROM questionnaire WHERE questionnaireid = $1', [questionnaireID]);
    if (qCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid questionnaireID'
      });
    }

    // Validation (existing)
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required'
      });
    }
    
    if (!type || !['essay', 'multiple_choice'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid question type is required (essay or multiple_choice)'
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    if (weight && (weight < 1 || weight > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be between 1 and 10'
      });
    }

    // Validate multiple choice options
    if (type === 'multiple_choice') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 options'
        });
      }

      const validOptions = options.filter(opt => opt && opt.trim() !== '');
      if (validOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 non-empty options'
        });
      }
    }

    const optionsJson = type === 'multiple_choice' && Array.isArray(options)
      ? JSON.stringify((options as string[]).filter((opt: string) => opt && opt.trim() !== ''))
      : null;

    const result = await pool.query(
      `INSERT INTO Question (questionnaireid, text, type, weight, category, require_evidence, options)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING questionID as id, questionnaireid AS "questionnaireID", text, type, weight, category, require_evidence, options, created_at`,
      [questionnaireID, text.trim(), type, weight || 1, category.trim(), require_evidence || false, optionsJson]
    );

    const newQuestion = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: newQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rawBody: any = req.body || {};
    const questionnaireID: number | null = rawBody.questionnaireID ?? rawBody.questionnaireId ?? rawBody.questionnaireid ?? null;
    const { text, type, weight, category, require_evidence, options }: any = rawBody;

    // Debug log to help trace payload issues
    console.debug('updateQuestion payload:', { id, questionnaireID, text, type, weight, category, require_evidence, options });

    // Get existing question including its questionnaireid
    const existingQuestion = await pool.query('SELECT questionID, questionnaireid FROM Question WHERE questionID = $1', [id]);
    if (existingQuestion.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    const currentQuestionnaireId = existingQuestion.rows[0].questionnaireid;

    // If provided, validate questionnaireID
    if (questionnaireID && questionnaireID !== currentQuestionnaireId) {
      const qCheck = await pool.query('SELECT questionnaireid FROM questionnaire WHERE questionnaireid = $1', [questionnaireID]);
      if (qCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid questionnaireID'
        });
      }
    }

    // Validation (same as create)
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required'
      });
    }

    if (!type || !['essay', 'multiple_choice'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid question type is required (essay or multiple_choice)'
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    if (weight && (weight < 1 || weight > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be between 1 and 10'
      });
    }

    // Validate multiple choice options
    if (type === 'multiple_choice') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 options'
        });
      }

      const validOptions = options.filter(opt => opt && opt.trim() !== '');
      if (validOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 non-empty options'
        });
      }
    }

    const optionsJson = type === 'multiple_choice' && Array.isArray(options)
      ? JSON.stringify((options as string[]).filter((opt: string) => opt && opt.trim() !== ''))
      : null;

    // Use provided questionnaireID or keep existing
    const questionnaireIdToUse = (questionnaireID !== undefined && questionnaireID !== null) ? questionnaireID : currentQuestionnaireId;

    const result = await pool.query(
      `UPDATE Question 
       SET questionnaireid = $1, text = $2, type = $3, weight = $4, category = $5, 
           require_evidence = $6, options = $7, updated_at = CURRENT_TIMESTAMP
       WHERE questionID = $8
       RETURNING questionID as id, questionnaireid AS "questionnaireID", text, type, weight, category, require_evidence, options, created_at, updated_at`,
      [questionnaireIdToUse, text.trim(), type, weight || 1, category.trim(), require_evidence || false, optionsJson, id]
    );

    const updatedQuestion = result.rows[0];
    // JSONB options are automatically parsed by pg driver, no need for JSON.parse

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM Question WHERE questionID = $1 RETURNING questionID as id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getQuestionCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT category 
       FROM Question 
       ORDER BY category`
    );

    const categories = result.rows.map((row: any) => row.category);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getQuestionStats = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN type = 'essay' THEN 1 END) as essay_questions,
        COUNT(CASE WHEN type = 'multiple_choice' THEN 1 END) as multiple_choice_questions,
        COUNT(CASE WHEN require_evidence = true THEN 1 END) as questions_requiring_evidence,
        COUNT(DISTINCT category) as total_categories,
        ROUND(AVG(weight), 2) as average_weight
      FROM Question
    `);

    const stats = result.rows[0];

    // Get category breakdown
    const categoryResult = await pool.query(`
      SELECT 
        category,
        COUNT(*) as question_count,
        ROUND(AVG(weight), 2) as avg_weight
      FROM Question
      GROUP BY category
      ORDER BY question_count DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        overview: stats,
        categories: categoryResult.rows
      }
    });
  } catch (error) {
    console.error('Error getting question stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving question statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get questions by questionnaire ID (untuk user mengisi)
export const getQuestionsByQuestionnaireId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionnaireId } = req.params;

    const query = `
      SELECT 
        q.questionID,
        q.text,
        q.type,
        q.weight,
        q.category,
        q.require_evidence,
        q.options,
        q.created_at,
        q.updated_at
      FROM Question q
      WHERE q.questionnaireid = $1
      ORDER BY q.questionID ASC
    `;

      // Query for options columns as well
      const optionQuery = `
        SELECT 
          q.questionID,
          q.text,
          q.type,
          q.weight,
          q.category,
          q.require_evidence,
          q.options,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.option_e,
          q.created_at,
          q.updated_at
        FROM Question q
        WHERE q.questionnaireid = $1
        ORDER BY q.questionID ASC
      `;
      const result = await pool.query(optionQuery, [questionnaireId]);

      // Always include option_a..option_e in options object
      const questionsWithOptions = result.rows.map(q => {
        let options = q.options;
        // If options is not an object, build from option_a..option_e
        if (!options || typeof options !== 'object') {
          options = {
            option_a: q.option_a || null,
            option_b: q.option_b || null,
            option_c: q.option_c || null,
            option_d: q.option_d || null,
            option_e: q.option_e || null
          };
        } else {
          // If options exists, still ensure option_a..option_e are present
          options = {
            option_a: q.option_a || options.option_a || null,
            option_b: q.option_b || options.option_b || null,
            option_c: q.option_c || options.option_c || null,
            option_d: q.option_d || options.option_d || null,
            option_e: q.option_e || options.option_e || null
          };
        }
        return {
          ...q,
          options
        };
      });

      // Debug: log first question with options
      if (questionsWithOptions.length > 0) {
        console.log('Sample question with options:', questionsWithOptions[0]);
      }

      res.status(200).json({
        success: true,
        data: questionsWithOptions,
        total: questionsWithOptions.length,
        message: `Found ${questionsWithOptions.length} questions for questionnaire ${questionnaireId}`
      });
  } catch (error) {
    console.error('Error fetching questions by questionnaire:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving questions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Submit user answers
export const submitAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionnaireId, answers } = req.body;
    const userId = (req as any).user?.userid; // from auth middleware

    if (!questionnaireId || !answers || !userId) {
      res.status(400).json({
        success: false,
        message: 'Missing required data: questionnaireId, answers, or user authentication'
      });
      return;
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create assessment record
      const assessmentQuery = `
        INSERT INTO Assessment (userID, questionnaireID, submittedAt, status)
        VALUES ($1, $2, NOW(), 'submitted')
        RETURNING assessmentID
      `;
      
      const assessmentResult = await client.query(assessmentQuery, [userId, questionnaireId]);
      const assessmentId = assessmentResult.rows[0].assessmentid;

      // Save individual answers
      for (const [questionId, answer] of Object.entries(answers)) {
        if (!questionId.includes('_evidence') && answer) { // Skip evidence files and empty answers
          const answerQuery = `
            INSERT INTO Answer (assessmentID, questionID, answerText)
            VALUES ($1, $2, $3)
          `;
          await client.query(answerQuery, [assessmentId, questionId, answer]);
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Assessment submitted successfully',
        data: {
          assessmentId,
          submittedAt: new Date().toISOString(),
          answersCount: Object.keys(answers).filter(key => !key.includes('_evidence')).length
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assessment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
