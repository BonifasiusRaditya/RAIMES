/**
 * AI Scoring Service Integration Example
 * Frontend integration code for using the AI scoring endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Score an assessment
 * @param assessmentId - The ID of the assessment to score
 * @param token - JWT authentication token
 * @returns Scoring result from AI Engine
 */
export const scoreAssessment = async (assessmentId, token) => {
  try {
    const response = await fetch(`${API_URL}/assessments/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ assessmentId }),
    });

    if (!response.ok) {
      throw new Error(`Scoring failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error scoring assessment:', error);
    throw error;
  }
};

/**
 * Get scoring result for an assessment
 * @param assessmentId - The ID of the assessment
 * @param token - JWT authentication token
 * @returns Scoring result details
 */
export const getAssessmentScoringResult = async (assessmentId, token) => {
  try {
    const response = await fetch(`${API_URL}/assessments/${assessmentId}/scoring`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve scoring result: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving scoring result:', error);
    throw error;
  }
};

/**
 * Get statistics for all assessments in a questionnaire
 * @param questionnaireId - The ID of the questionnaire
 * @param token - JWT authentication token
 * @returns Statistics about assessments and their scores
 */
export const getScoringStatistics = async (questionnaireId, token) => {
  try {
    const response = await fetch(`${API_URL}/assessments/statistics/${questionnaireId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve statistics: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving statistics:', error);
    throw error;
  }
};

/**
 * React Component Example: Assessment Scoring Button
 */
export const ScoringButton = ({ assessmentId, onScoreComplete, token }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleScore = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scoreAssessment(assessmentId, token);

      if (result.success) {
        console.log('Scoring completed!');
        console.log('Overall Score:', result.scoring.overall_score);
        console.log('Recommendations:', result.scoring.recommendations);

        // Callback to parent component
        if (onScoreComplete) {
          onScoreComplete(result.scoring);
        }
      } else {
        setError(result.message || 'Scoring failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during scoring');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scoring-button-container">
      <button
        onClick={handleScore}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Scoring...' : 'Score Assessment'}
      </button>
      {error && (
        <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * React Component Example: Scoring Results Display
 */
export const ScoringResultsDisplay = ({ assessmentId, token }) => {
  const [scoring, setScoring] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadScoring = async () => {
      try {
        const result = await getAssessmentScoringResult(assessmentId, token);
        if (result.success) {
          setScoring(result.assessment);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadScoring();
  }, [assessmentId, token]);

  if (loading) return <div>Loading scoring results...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!scoring) return <div>No scoring results available</div>;

  const score = scoring.scoring;

  return (
    <div className="scoring-results" style={{ padding: '20px', border: '1px solid #ddd' }}>
      <h2>Assessment Results</h2>

      <div className="overall-score" style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
        Overall Score: <span style={{ color: score.overall_score >= 70 ? 'green' : 'orange' }}>
          {score.overall_score.toFixed(2)}/100
        </span>
      </div>

      <div className="category-scores" style={{ marginTop: '20px' }}>
        <h3>Category Scores:</h3>
        <ul>
          {Object.entries(score.individual_scores).map(([category, data]) => (
            <li key={category}>
              <strong>{category}:</strong> {data.score.toFixed(2)}/100
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                {data.feedback}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {score.strengths?.length > 0 && (
        <div className="strengths" style={{ marginTop: '15px' }}>
          <h3>Strengths:</h3>
          <ul>
            {score.strengths.map((strength, i) => (
              <li key={i} style={{ color: 'green' }}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {score.weaknesses?.length > 0 && (
        <div className="weaknesses" style={{ marginTop: '15px' }}>
          <h3>Areas for Improvement:</h3>
          <ul>
            {score.weaknesses.map((weakness, i) => (
              <li key={i} style={{ color: 'red' }}>{weakness}</li>
            ))}
          </ul>
        </div>
      )}

      {score.recommendations?.length > 0 && (
        <div className="recommendations" style={{ marginTop: '15px' }}>
          <h3>Recommendations:</h3>
          <ol>
            {score.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ol>
        </div>
      )}

      {score.detailed_analysis && (
        <div className="analysis" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          <h3>Detailed Analysis:</h3>
          <p>{score.detailed_analysis}</p>
        </div>
      )}
    </div>
  );
};

/**
 * React Hook for Scoring Operations
 */
export const useScoringOperations = (token) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const scoreAssessmentHook = React.useCallback(async (assessmentId) => {
    setIsLoading(true);
    setError(null);
    try {
      return await scoreAssessment(assessmentId, token);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const getResults = React.useCallback(async (assessmentId) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getAssessmentScoringResult(assessmentId, token);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const getStats = React.useCallback(async (questionnaireId) => {
    setIsLoading(true);
    setError(null);
    try {
      return await getScoringStatistics(questionnaireId, token);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    isLoading,
    error,
    scoreAssessment: scoreAssessmentHook,
    getResults,
    getStats,
  };
};

export default {
  scoreAssessment,
  getAssessmentScoringResult,
  getScoringStatistics,
  ScoringButton,
  ScoringResultsDisplay,
  useScoringOperations,
};
