import type { Request, Response } from 'express';
import pool from '../config/database.js';

interface Questionnaire {
  questionnaireid?: number;
  title: string;
  version?: string;
  description?: string;
  standard?: string;
  created_at?: string;
  updated_at?: string;
}

// Test endpoint to check if controller is working
// /api/questionnaires/test
export const testQuestionnaires = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Questionnaire controller is working',
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

// Get all questionnaires
// /api/questionnaires
export const getAllQuestionnaires = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT 
        questionnaireid as id,
        title,
        version,
        description,
        standard,
        (SELECT COUNT(*) FROM question WHERE questionnaireid = questionnaire.questionnaireid) as question_count
      FROM questionnaire
      ORDER BY questionnaireid DESC
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      message: 'Questionnaires retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting questionnaires:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving questionnaires',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single questionnaire by ID with its questions
// /api/questionnaires/:id
export const getQuestionnaireById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get questionnaire details
    const questionnaireResult = await pool.query(
      `SELECT questionnaireid as id, title, version, description, standard
       FROM questionnaire 
       WHERE questionnaireid = $1`,
      [id]
    );

    if (questionnaireResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Questionnaire not found'
      });
      return;
    }

    // Get associated questions
    const questionsResult = await pool.query(
      `SELECT questionid as id, questionnaireid, text, type, weight, category, require_evidence, options, 
              created_at, updated_at 
       FROM question 
       WHERE questionnaireid = $1
       ORDER BY questionid ASC`,
      [id]
    );

    const questionnaire = questionnaireResult.rows[0];
    // JSONB options are automatically parsed by pg driver, no need for JSON.parse
    const questions = questionsResult.rows;

    res.status(200).json({
      success: true,
      data: {
        ...questionnaire,
        questions,
        question_count: questions.length
      }
    });
  } catch (error) {
    console.error('Error getting questionnaire:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving questionnaire',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new questionnaire
// /api/questionnaires
export const createQuestionnaire = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, version, description, standard }: Questionnaire = req.body;

    console.debug('createQuestionnaire payload:', { title, version, description, standard });

    // Validation
    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Title is required'
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO questionnaire (title, version, description, standard)
       VALUES ($1, $2, $3, $4)
       RETURNING questionnaireid as id, title, version, description, standard`,
      [title.trim(), version?.trim() || null, description?.trim() || null, standard?.trim() || null]
    );

    const newQuestionnaire = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Questionnaire created successfully',
      data: newQuestionnaire
    });
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating questionnaire',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update an existing questionnaire
// /api/questionnaires/:id
export const updateQuestionnaire = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, version, description, standard }: Questionnaire = req.body;

    console.debug('updateQuestionnaire payload:', { id, title, version, description, standard });

    // Check if questionnaire exists
    const existingQuestionnaire = await pool.query(
      'SELECT questionnaireid FROM questionnaire WHERE questionnaireid = $1',
      [id]
    );

    if (existingQuestionnaire.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Questionnaire not found'
      });
      return;
    }

    // Validation
    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Title is required'
      });
      return;
    }

    const result = await pool.query(
      `UPDATE questionnaire 
       SET title = $1, version = $2, description = $3, standard = $4
       WHERE questionnaireid = $5
       RETURNING questionnaireid as id, title, version, description, standard`,
      [title.trim(), version?.trim() || null, description?.trim() || null, standard?.trim() || null, id]
    );

    const updatedQuestionnaire = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Questionnaire updated successfully',
      data: updatedQuestionnaire
    });
  } catch (error) {
    console.error('Error updating questionnaire:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating questionnaire',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a questionnaire
// /api/questionnaires/:id
export const deleteQuestionnaire = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if questionnaire has associated questions
    const questionsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM question WHERE questionnaireid = $1',
      [id]
    );

    const questionCount = parseInt(questionsCheck.rows[0].count);

    if (questionCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete questionnaire with ${questionCount} associated question(s). Delete questions first.`
      });
      return;
    }

    const result = await pool.query(
      'DELETE FROM questionnaire WHERE questionnaireid = $1 RETURNING questionnaireid as id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Questionnaire not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Questionnaire deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting questionnaire',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get questionnaire statistics
// /api/questionnaires/stats
export const getQuestionnaireStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_questionnaires,
        COUNT(DISTINCT standard) as total_standards,
        SUM((SELECT COUNT(*) FROM question WHERE questionnaireid = questionnaire.questionnaireid)) as total_questions
      FROM questionnaire
    `);

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting questionnaire stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving questionnaire statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
