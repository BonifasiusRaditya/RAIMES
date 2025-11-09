import type { Request, Response } from 'express';
import pool from '../config/database.js';

interface Question {
  questionID?: number;
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
          SELECT questionID as id, text, type, weight, category, require_evidence, options, 
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
        
        // Parse options JSON for multiple choice questions
        const questions = result.rows.map((question: any) => ({
            ...question,
            options: question.options ? JSON.parse(question.options) : null
        }));

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
      SELECT questionID as id, text, type, weight, category, require_evidence, options, 
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
    
    // Parse options JSON for multiple choice questions
    const questions = result.rows.map((question: any) => ({
      ...question,
      options: question.options ? JSON.parse(question.options) : null
    }));

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
      `SELECT questionID as id, text, type, weight, category, require_evidence, options, 
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
    // Parse options JSON for multiple choice questions
    if (question.options) {
      question.options = JSON.parse(question.options);
    }

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
    const { text, type, weight, category, require_evidence, options }: Question = req.body;

    // Validation
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

      // Check for empty options
      const validOptions = options.filter(opt => opt && opt.trim() !== '');
      if (validOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 non-empty options'
        });
      }
    }

    // Prepare options for database storage
    const optionsJson = type === 'multiple_choice' && options 
      ? JSON.stringify(options.filter(opt => opt && opt.trim() !== ''))
      : null;

    const result = await pool.query(
      `INSERT INTO Question (text, type, weight, category, require_evidence, options)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING questionID as id, text, type, weight, category, require_evidence, options, created_at`,
      [text.trim(), type, weight || 1, category.trim(), require_evidence || false, optionsJson]
    );

    const newQuestion = result.rows[0];
    // Parse options back to array for response
    if (newQuestion.options) {
      newQuestion.options = JSON.parse(newQuestion.options);
    }

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
    const { text, type, weight, category, require_evidence, options }: Question = req.body;

    // Check if question exists
    const existingQuestion = await pool.query('SELECT questionID FROM Question WHERE questionID = $1', [id]);
    if (existingQuestion.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
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

    // Prepare options for database storage
    const optionsJson = type === 'multiple_choice' && options 
      ? JSON.stringify(options.filter(opt => opt && opt.trim() !== ''))
      : null;

    const result = await pool.query(
      `UPDATE Question 
       SET text = $1, type = $2, weight = $3, category = $4, 
           require_evidence = $5, options = $6, updated_at = CURRENT_TIMESTAMP
       WHERE questionID = $7
       RETURNING questionID as id, text, type, weight, category, require_evidence, options, created_at, updated_at`,
      [text.trim(), type, weight || 1, category.trim(), require_evidence || false, optionsJson, id]
    );

    const updatedQuestion = result.rows[0];
    // Parse options back to array for response
    if (updatedQuestion.options) {
      updatedQuestion.options = JSON.parse(updatedQuestion.options);
    }

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
