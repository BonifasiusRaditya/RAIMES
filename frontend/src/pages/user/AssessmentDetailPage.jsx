import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { assessmentService } from "../../services/assessmentService";

export default function AssessmentDetailPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    fetchAssessmentDetail();
  }, [assessmentId]);

  const fetchAssessmentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await assessmentService.getAssessmentDetail(assessmentId);
      
      if (response.success) {
        setAssessment(response.data);
      }
    } catch (err) {
      console.error('Error fetching assessment detail:', err);
      setError('Failed to load assessment details');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-raimes-purple"></div>
            <span className="ml-4 text-gray-600">
              Loading assessment details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/results")}
              className="bg-raimes-purple hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/results")}
            className="flex items-center text-raimes-purple hover:text-raimes-purple/80 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Results
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {assessment.questionnaireTitle}
          </h1>
          <p className="text-gray-600">
            {assessment.companyName} - Completed on {formatDate(assessment.completionDate)}
          </p>
        </div>

        {/* Overall Score & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Final Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(assessment.finalScore || assessment.calculatedScore)}`}>
              {(assessment.finalScore || assessment.calculatedScore).toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Progress</div>
            <div className="text-4xl font-bold text-raimes-purple">
              {assessment.progressPercentage}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Questions Answered</div>
            <div className="text-4xl font-bold text-blue-600">
              {assessment.answeredQuestions}/{assessment.totalQuestions}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className="text-xl font-bold text-green-600 capitalize mt-2">
              {assessment.status}
            </div>
          </div>
        </div>

        {/* Questions by Category */}
        <div className="space-y-6">
          {Object.entries(assessment.questionsByCategory).map(([category, questions]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-raimes-purple mb-4">{category}</h2>
              <div className="space-y-4">
                {questions.map((question, idx) => (
                  <div 
                    key={question.questionId}
                    className="border-l-4 border-raimes-purple pl-4 py-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {idx + 1}. {question.questionText}
                      </h3>
                      <div className="flex items-center gap-2">
                        {question.evidenceRequired && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Evidence Required
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Weight: {question.weight}
                        </span>
                      </div>
                    </div>
                    
                    {question.answered ? (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600 mb-1">Answer:</div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-900">{question.answer || 'No response'}</p>
                        </div>
                        
                        {question.evidencePath && (
                          <div className="mt-2 flex items-center text-sm text-green-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Evidence uploaded
                          </div>
                        )}
                        
                        {question.score !== null && question.score !== undefined && (
                          <div className="mt-2">
                            <span className="text-sm font-semibold">Score: </span>
                            <span className={`text-sm font-bold ${getScoreColor((question.score / question.weight) * 100)}`}>
                              {question.score}/{question.weight}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-gray-500 italic">
                        Not answered
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Start Date:</span>
              <div className="font-semibold">{formatDate(assessment.startDate)}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Completion Date:</span>
              <div className="font-semibold">{formatDate(assessment.completionDate)}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Company:</span>
              <div className="font-semibold">{assessment.companyName}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Assessment ID:</span>
              <div className="font-semibold">#{assessment.assessmentId}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
