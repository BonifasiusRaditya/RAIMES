import pool from '../config/database.js';
import fs from 'fs';
import FormData from 'form-data';
import nodeFetch from 'node-fetch';

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
  score?: number;
  analysis?: string; // Add analysis field
  evaluation_date?: string;
  score_details?: any;
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
const AI_SCORING_ENDPOINT = `${AI_ENGINE_URL}/analyze-mining-questionnaire`;

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
 * Converts assessment data into the format expected by the AI engine
 */
export const prepareScoringData = (assessmentData: AssessmentData): string => {
  // Build questionnaire text with all questions and answers in detailed format
  let questionnaireText = `MINING ASSESSMENT EVALUATION\n`;
  questionnaireText += `Assessment ID: ${assessmentData.assessmentid}\n`;
  questionnaireText += `Company ID: ${assessmentData.companyid}\n`;
  questionnaireText += `Total Questions: ${assessmentData.questions.length}\n\n`;

  // Group by category for better organization
  const categorizedQuestions: { [key: string]: any[] } = {};
  
  assessmentData.questions.forEach(question => {
    const category = question.category || 'General';
    if (!categorizedQuestions[category]) {
      categorizedQuestions[category] = [];
    }
    categorizedQuestions[category].push(question);
  });

  // Calculate total possible score
  let totalMaxScore = 0;
  let totalEarnedScore = 0;

  // Format each category with detailed scoring information
  Object.entries(categorizedQuestions).forEach(([category, questions]) => {
    questionnaireText += `\n=== CATEGORY: ${category.toUpperCase()} ===\n\n`;
    
    questions.forEach(question => {
      const answer = assessmentData.answers.find(
        (a) => a.questionid === question.questionid
      );
      
      // Calculate earned points based on answer
      let earnedPoints = 0;
      let answerPercentage = 0;
      
      if (answer?.response) {
        if (answer.response === 'option_a') answerPercentage = 0;
        else if (answer.response === 'option_b') answerPercentage = 25;
        else if (answer.response === 'option_c') answerPercentage = 50;
        else if (answer.response === 'option_d') answerPercentage = 75;
        else if (answer.response === 'option_e') answerPercentage = 100;
        
        earnedPoints = (question.weight * answerPercentage) / 100;
      }
      
      totalMaxScore += question.weight;
      totalEarnedScore += earnedPoints;
      
      questionnaireText += `Question ${question.questionid}: ${question.text}\n`;
      questionnaireText += `Max Points: ${question.weight}\n`;
      questionnaireText += `Selected Answer: ${answer?.response || 'Not answered'} (${answerPercentage}%)\n`;
      questionnaireText += `Earned Points: ${earnedPoints.toFixed(2)}\n`;
      
      // Add answer text if it's not a simple option
      if (answer?.response && !answer.response.startsWith('option_')) {
        questionnaireText += `Answer Details: ${answer.response}\n`;
      }
      
      questionnaireText += `\n`;
    });
  });

  // Add summary
  questionnaireText += `\n=== ASSESSMENT SUMMARY ===\n`;
  questionnaireText += `Total Max Points: ${totalMaxScore}\n`;
  questionnaireText += `Total Earned Points: ${totalEarnedScore.toFixed(2)}\n`;
  questionnaireText += `Preliminary Score: ${totalMaxScore > 0 ? ((totalEarnedScore / totalMaxScore) * 100).toFixed(2) : 0}%\n`;

  return questionnaireText;
};

/**
 * Call AI Engine for scoring
 */
export const callAIEngine = async (
  questionnaireText: string,
  assessmentId: number,
  evidenceFilePath?: string | null
): Promise<AIEngineResponse> => {
  try {
    console.log(`🤖 Calling AI Engine at ${AI_SCORING_ENDPOINT}`);
    console.log('📊 Sending questionnaire_answers text length:', questionnaireText.length);

    const formData = new FormData();
    formData.append('questionnaire_answers', questionnaireText);

    if (evidenceFilePath && fs.existsSync(evidenceFilePath)) {
      try {
        const fileStream = fs.createReadStream(evidenceFilePath);
        const fileName = evidenceFilePath.split(/[\\/]/).pop() || 'evidence.pdf';
        formData.append('supporting_file', fileStream, fileName);
        console.log('📎 Attached supporting_file to AI request:', fileName);
      } catch (fileErr) {
        console.warn('⚠️ Could not attach evidence file to AI request:', fileErr);
      }
    }

    // Get form-data headers and merge with fetch
    const formHeaders = formData.getHeaders();
    console.log('📋 Form content-type:', formHeaders['content-type']);

    // Use node-fetch v2 which properly supports form-data
    const response = await nodeFetch(AI_SCORING_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: formHeaders,
    });

    if (!response.ok) {
      console.error(`AI Engine returned status ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);

      return {
        success: false,
        error: `AI Engine error: ${response.status}`,
      };
    }

    const result = await response.json();
    console.log('✅ AI Engine response received:', JSON.stringify(result, null, 2));
    // Type guard: cek jika result adalah object dan punya property yang diharapkan
    if (typeof result === 'object' && result !== null) {
      const r = result as {
        score?: number;
        analysis?: string;
        evaluation_date?: string;
        score_details?: any;
      };
      console.log('🔍 Checking analysis field:', {
        hasAnalysis: 'analysis' in r,
        analysisType: typeof r.analysis,
        analysisLength: r.analysis?.length || 0,
        analysisPreview: r.analysis?.substring(0, 100)
      });

      // Extract score and analysis from response
      if (typeof r.score === 'number') {
        console.log('✅ Returning AI response with:', {
          score: r.score,
          hasAnalysis: !!r.analysis,
          analysisLength: r.analysis?.length || 0
        });
        return {
          success: true,
          score: r.score,
          analysis: r.analysis || '', // Always return string
          evaluation_date: r.evaluation_date || '', // Always return string
          score_details: r.score_details,
        };
      } else {
        console.error('Invalid AI Engine response format:', result);
        return {
          success: false,
          error: 'Invalid response format from AI Engine',
        };
      }
    } else {
      console.error('Invalid AI Engine response type:', result);
      return {
        success: false,
        error: 'Invalid AI Engine response type',
      };
    }
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
 * Request AI scoring for an assessment and return just the score
 */
export const getAIScoreForAssessment = async (assessmentid: number, evidenceFilePath?: string | null): Promise<{
  success: boolean;
  score?: number;
  analysis?: string | undefined;
  error?: string;
}> => {
  try {
    console.log(`\n🎯 Requesting AI score for assessment ID: ${assessmentid}`);

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

    // Prepare scoring data (questionnaire_answers text)
    const questionnaireText = prepareScoringData(assessmentData);
    console.log('✅ questionnaire_answers text prepared, length:', questionnaireText.length);

    // Call AI Engine using multipart/form-data with optional supporting_file
    const aiResponse = await callAIEngine(questionnaireText, assessmentid, evidenceFilePath);

    if (aiResponse.success && typeof aiResponse.score === 'number') {
      console.log('🎉 AI Engine scoring successful, score:', aiResponse.score);
      console.log('📝 AI analysis text length:', aiResponse.analysis?.length || 0);
      console.log('📝 AI analysis preview:', aiResponse.analysis?.substring(0, 200));
      
      // Update assessment with AI score AND analysis
      const updateQuery = `
        UPDATE Assessment
        SET 
          finalscore = $1,
          aianalysis = $2,
          completiondate = COALESCE(completiondate, NOW())
        WHERE assessmentid = $3
        RETURNING assessmentid, finalscore, aianalysis, LENGTH(aianalysis) as analysis_length
      `;

      const updateResult = await pool.query(updateQuery, [
        aiResponse.score,
        aiResponse.analysis || null,
        assessmentid
      ]);
      
      console.log('✅ AI score and analysis saved to database');
      console.log('📊 Database update result:', {
        assessmentid: updateResult.rows[0].assessmentid,
        finalscore: updateResult.rows[0].finalscore,
        analysis_length: updateResult.rows[0].analysis_length
      });

      return {
        success: true,
        score: aiResponse.score,
        analysis: aiResponse.analysis || undefined,
      };
    } else {
      console.error('❌ AI Engine failed:', aiResponse.error);
      return {
        success: false,
        error: aiResponse.error || 'Failed to get AI score',
      };
    }
  } catch (error) {
    console.error('Error getting AI score:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during AI scoring',
    };
  }
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

    // Use the working getAIScoreForAssessment function
    const result = await getAIScoreForAssessment(assessmentid);
    
    if (result.success && result.score !== undefined) {
      console.log('✅ Assessment scored successfully with score:', result.score);
      
      // Return in the expected format
      return {
        success: true,
        scoring: {
          individual_scores: {},
          overall_score: result.score,
          recommendations: [],
          strengths: [],
          weaknesses: [],
          detailed_analysis: 'AI analysis completed'
        }
      };
    } else {
      console.error('❌ Scoring failed:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to score assessment',
      };
    }
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
