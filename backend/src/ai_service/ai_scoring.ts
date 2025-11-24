import pool from '../config/database.js';

// Types for AI Scoring Service
interface AssessmentData {
  assessmentid: number;
  companyid: number;
  questionnaireid: number;
  answers: Answer[];
  questions: Question[];
}

interface Answer {
  questionid: number;
  response: string;
}

interface Question {
  questionid: number;
  text: string;
  category: string;
  weight: number;
  type: 'essay' | 'multiple_choice';
  require_evidence: boolean;
}

interface ScoringRequest {
  assessmentid: number;
  answers: Array<{
    questionid: number;
    text: string;
    answer: string;
    category: string;
    weight: number;
  }>;
}

interface AIEngineResponse {
  success: boolean;
  scoring?: ScoringResult;
  error?: string;
}

interface ScoringResult {
  individual_scores: {
    [key: string]: {
      score: number;
      feedback: string;
      category: string;
    };
  };
  overall_score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  detailed_analysis: string;
}

// AI Engine configuration
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'https://ai-engine-raimes.vercel.app';

/**
 * Get assessment data with all answers and questions
 */
export const getAssessmentData = async (
  assessmentid: number
): Promise<AssessmentData | null> => {
  try {
    // Get assessment basic info
    const assessmentQuery = `
      SELECT 
        a.assessmentid,
        a.companyid,
        a.questionnaireid,
        a.status
      FROM Assessment a
      WHERE a.assessmentid = $1
    `;

    const assessmentResult = await pool.query(assessmentQuery, [assessmentid]);
    if (assessmentResult.rows.length === 0) {
      console.error(`Assessment ${assessmentid} not found`);
      return null;
    }

    const assessment = assessmentResult.rows[0];

    // Get all answers for this assessment
    const answersQuery = `
      SELECT 
        an.questionid,
        an.response
      FROM Answer an
      WHERE an.assessmentid = $1
    `;

    const answersResult = await pool.query(answersQuery, [assessmentid]);
    const answers: Answer[] = answersResult.rows.map((row: any) => ({
      questionid: row.questionid,
      response: row.response,
    }));

    // Get all questions for this questionnaire
    const questionsQuery = `
      SELECT 
        q.questionid,
        q.text,
        q.category,
        q.weight,
        q.type,
        q.require_evidence
      FROM Question q
      WHERE q.questionnaireid = $1
      ORDER BY q.questionid
    `;

    const questionsResult = await pool.query(questionsQuery, [
      assessment.questionnaireid,
    ]);
    const questions: Question[] = questionsResult.rows;

    return {
      assessmentid: assessment.assessmentid,
      companyid: assessment.companyid,
      questionnaireid: assessment.questionnaireid,
      answers,
      questions,
    };
  } catch (error) {
    console.error('Error fetching assessment data:', error);
    return null;
  }
};

/**
 * Prepare data for AI Engine scoring
 */
export const prepareScoringData = (assessmentData: AssessmentData): ScoringRequest => {
  const scoringData: ScoringRequest = {
    assessmentid: assessmentData.assessmentid,
    answers: [],
  };

  // Map answers to questions
  for (const question of assessmentData.questions) {
    const answer = assessmentData.answers.find(
      (a) => a.questionid === question.questionid
    );

    scoringData.answers.push({
      questionid: question.questionid,
      text: question.text,
      answer: answer?.response || '',
      category: question.category,
      weight: question.weight,
    });
  }

  return scoringData;
};

/**
 * Call AI Engine for scoring
 */
export const callAIEngine = async (
  scoringData: ScoringRequest
): Promise<AIEngineResponse> => {
  try {
    console.log(`🤖 Calling AI Engine at ${AI_ENGINE_URL}/api/score`);
    console.log('📊 Scoring data:', {
      assessmentid: scoringData.assessmentid,
      answersCount: scoringData.answers.length,
    });

    const response = await fetch(`${AI_ENGINE_URL}/api/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoringData),
    });

    if (!response.ok) {
      console.error(`AI Engine returned status ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);

      // Return fallback scoring if AI Engine fails
      return {
        success: false,
        error: `AI Engine error: ${response.status}`,
      };
    }

    const result = await response.json();
    console.log('✅ AI Engine response received');

    return {
      success: true,
      scoring: result as ScoringResult,
    };
  } catch (error) {
    console.error('Error calling AI Engine:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Calculate fallback score when AI Engine is unavailable
 */
export const calculateFallbackScore = (assessmentData: AssessmentData): ScoringResult => {
  console.log('⚠️ Using fallback scoring algorithm');

  const categoryScores: { [key: string]: number[] } = {};
  const categoryFeedback: { [key: string]: string[] } = {};

  // Calculate scores by category
  for (const question of assessmentData.questions) {
    const answer = assessmentData.answers.find(
      (a) => a.questionid === question.questionid
    );

    if (!categoryScores[question.category]) {
      categoryScores[question.category] = [];
      categoryFeedback[question.category] = [];
    }

    // Simple scoring logic based on answer content
    let score = 0;
    let feedback = 'No response provided';

    if (answer?.response && answer.response.trim().length > 0) {
      const answerLength = answer.response.trim().length;

      // Score based on response length and content
      if (answerLength < 50) {
        score = 40;
        feedback = 'Limited response - consider providing more detail';
      } else if (answerLength < 200) {
        score = 60;
        feedback = 'Moderate response - could be more comprehensive';
      } else if (answerLength < 500) {
        score = 75;
        feedback = 'Good response with adequate detail';
      } else {
        score = 85;
        feedback = 'Comprehensive response with good coverage';
      }

      // Boost score if specific metrics/data mentioned
      if (/\d+%|\d+\s*(kg|ton|liter|metre|meter)/.test(answer.response)) {
        score = Math.min(95, score + 10);
        feedback = 'Evidence of data-driven approach';
      }
    } else {
      score = 0;
      feedback = 'Question not answered';
    }

    const categoryEntry = categoryScores[question.category];
    if (categoryEntry) {
      categoryEntry.push(score * question.weight);
    }
    
    const feedbackEntry = categoryFeedback[question.category];
    if (feedbackEntry) {
      feedbackEntry.push(feedback);
    }
  }

  // Calculate category averages
  const individualScores: { [key: string]: any } = {};
  let totalScore = 0;
  let categoryCount = 0;

  for (const [category, scores] of Object.entries(categoryScores)) {
    const avgScore = scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1);
    individualScores[category] = {
      score: Math.round(avgScore * 100) / 100,
      feedback: (categoryFeedback[category]?.[0]) || 'No feedback',
      category,
    };
    totalScore += avgScore;
    categoryCount++;
  }

  const overallScore = Math.round((totalScore / Math.max(categoryCount, 1)) * 100) / 100;

  // Generate generic recommendations
  const recommendations = [
    'Continue to improve documentation of sustainability practices',
    'Enhance monitoring and measurement systems',
    'Strengthen stakeholder engagement processes',
    'Document lessons learned and best practices',
    'Consider third-party verification of key processes',
  ];

  const strengths = [
    'Commitment to sustainability assessment',
    'Participation in formal evaluation process',
  ];

  const weaknesses = overallScore < 60 ? ['Limited documentation of practices', 'Need for improved systems'] : [];

  return {
    individual_scores: individualScores,
    overall_score: overallScore,
    recommendations,
    strengths,
    weaknesses,
    detailed_analysis: `Assessment completed with overall score of ${overallScore.toFixed(2)}/100. ${categoryCount} categories evaluated.`,
  };
};

/**
 * Score an assessment using AI Engine
 */
export const scoreAssessment = async (assessmentid: number): Promise<{
  success: boolean;
  scoring?: ScoringResult;
  error?: string;
}> => {
  try {
    console.log(`\n🎯 Starting assessment scoring for ID: ${assessmentid}`);

    // Get assessment data
    const assessmentData = await getAssessmentData(assessmentid);
    if (!assessmentData) {
      return {
        success: false,
        error: 'Assessment not found',
      };
    }

    console.log('📋 Assessment data loaded:', {
      questionnaireid: assessmentData.questionnaireid,
      questionsCount: assessmentData.questions.length,
      answersCount: assessmentData.answers.length,
    });

    // Validate that all questions are answered
    const unansweredQuestions = assessmentData.questions.filter(
      (q) => !assessmentData.answers.find((a) => a.questionid === q.questionid)
    );

    if (unansweredQuestions.length > 0) {
      console.warn(`⚠️ ${unansweredQuestions.length} questions are not answered`);
      return {
        success: false,
        error: `Cannot score assessment: ${unansweredQuestions.length} questions remain unanswered`,
      };
    }

    // Prepare scoring data
    const scoringData = prepareScoringData(assessmentData);
    console.log('✅ Scoring data prepared');

    // Try to call AI Engine
    const aiResponse = await callAIEngine(scoringData);

    let scoringResult: ScoringResult;

    if (aiResponse.success && aiResponse.scoring) {
      console.log('🎉 AI Engine scoring successful');
      scoringResult = aiResponse.scoring;
    } else {
      console.log('⚠️ AI Engine unavailable, using fallback algorithm');
      scoringResult = calculateFallbackScore(assessmentData);
    }

    // Save scoring result to database
    const updateQuery = `
      UPDATE Assessment
      SET 
        status = 'scored',
        finalscore = $1,
        scoringdetails = $2,
        scoreddate = NOW()
      WHERE assessmentid = $3
      RETURNING assessmentid, finalscore, status
    `;

    const updateResult = await pool.query(updateQuery, [
      scoringResult.overall_score,
      JSON.stringify(scoringResult),
      assessmentid,
    ]);

    if (updateResult.rows.length === 0) {
      return {
        success: false,
        error: 'Failed to update assessment with scoring results',
      };
    }

    console.log('✅ Assessment scoring saved to database');
    console.log(`📊 Final Score: ${scoringResult.overall_score}/100`);

    return {
      success: true,
      scoring: scoringResult,
    };
  } catch (error) {
    console.error('Error scoring assessment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during scoring',
    };
  }
};

/**
 * Get scoring result for an assessment
 */
export const getScoringResult = async (
  assessmentid: number
): Promise<ScoringResult | null> => {
  try {
    const query = `
      SELECT scoringdetails
      FROM Assessment
      WHERE assessmentid = $1 AND status = 'scored'
    `;

    const result = await pool.query(query, [assessmentid]);
    if (result.rows.length === 0) {
      console.warn(`No scoring result found for assessment ${assessmentid}`);
      return null;
    }

    return JSON.parse(result.rows[0].scoringdetails);
  } catch (error) {
    console.error('Error retrieving scoring result:', error);
    return null;
  }
};

/**
 * Get scoring statistics for comparisons
 */
export const getScoringStatistics = async (questionnaireid: number): Promise<any> => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_assessments,
        COUNT(CASE WHEN status = 'scored' THEN 1 END) as scored_count,
        AVG(CASE WHEN finalscore IS NOT NULL THEN finalscore END)::float as average_score,
        MIN(CASE WHEN finalscore IS NOT NULL THEN finalscore END)::float as min_score,
        MAX(CASE WHEN finalscore IS NOT NULL THEN finalscore END)::float as max_score,
        STDDEV(CASE WHEN finalscore IS NOT NULL THEN finalscore END)::float as stddev_score
      FROM Assessment
      WHERE questionnaireid = $1
    `;

    const result = await pool.query(query, [questionnaireid]);
    return result.rows[0];
  } catch (error) {
    console.error('Error retrieving scoring statistics:', error);
    return null;
  }
};

/**
 * Batch score multiple assessments
 */
export const batchScoreAssessments = async (assessmentIds: number[]): Promise<{
  success: boolean;
  results: Array<{
    assessmentid: number;
    success: boolean;
    score?: number;
    error?: string;
  }>;
}> => {
  try {
    console.log(`\n📦 Starting batch scoring for ${assessmentIds.length} assessments`);

    const results: Array<{
      assessmentid: number;
      success: boolean;
      score?: number;
      error?: string;
    }> = [];

    for (let i = 0; i < assessmentIds.length; i++) {
      const assessmentid: number = assessmentIds[i] || 0;
      console.log(`[${i + 1}/${assessmentIds.length}] Scoring assessment ${assessmentid}...`);

      const scoreResult = await scoreAssessment(assessmentid);

      results.push({
        assessmentid,
        success: scoreResult.success,
        ...(scoreResult.scoring?.overall_score !== undefined && { score: scoreResult.scoring.overall_score }),
        ...(scoreResult.error && { error: scoreResult.error }),
      });

      // Add delay to avoid overwhelming AI Engine
      if (i < assessmentIds.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log('✅ Batch scoring completed');
    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error('Error in batch scoring:', error);
    return {
      success: false,
      results: assessmentIds.map((id) => ({
        assessmentid: id,
        success: false,
        error: 'Batch scoring failed',
      })),
    };
  }
};

export default {
  getAssessmentData,
  prepareScoringData,
  callAIEngine,
  calculateFallbackScore,
  scoreAssessment,
  getScoringResult,
  getScoringStatistics,
  batchScoreAssessments,
};
