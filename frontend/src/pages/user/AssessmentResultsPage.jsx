import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { assessmentService } from "../../services/assessmentService";

export default function AssessmentResultsPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchAssessmentDetail();
  }, [assessmentId]);

  const fetchAssessmentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await assessmentService.getAssessmentDetail(assessmentId);

      if (response && response.success) {
        setAssessment(response.data);
        // Expand all categories by default
        const categories = Object.keys(response.data.questionsByCategory || {});
        const expanded = {};
        categories.forEach(cat => expanded[cat] = true);
        setExpandedCategories(expanded);
      } else {
        setError(response?.message || "Failed to load assessment details");
      }
    } catch (err) {
      console.error("Error fetching assessment detail:", err);
      const errorMsg =
        typeof err === "string"
          ? err
          : err.response?.data?.message || err.message || "Failed to load assessment details";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (!score && score !== 0) return "text-gray-600";
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in_progress":
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const downloadPDF = async () => {
    alert("PDF download functionality will be implemented soon");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-raimes-purple"></div>
            <span className="ml-4 text-gray-600">Loading assessment details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-12">
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
            <p className="text-red-600 mb-4 font-semibold">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/results")}
                className="bg-raimes-purple hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Back to Results
              </button>
              <button
                onClick={fetchAssessmentDetail}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const categories = Object.entries(assessment.questionsByCategory || {});
  const totalAnswered = assessment.answeredQuestions || 0;
  const totalQuestions = assessment.totalQuestions || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-12">
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

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {assessment.questionnaireTitle || `Assessment #${assessment.assessmentId}`}
              </h1>
              <p className="text-gray-600">
                {assessment.questionnaireDescription}
              </p>
            </div>
            <button
              onClick={downloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Status & Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Final Score */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Final Score</div>
            <div className={`text-3xl font-bold ${getScoreColor(assessment.finalScore)}`}>
              {assessment.finalScore ? parseFloat(assessment.finalScore).toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-2">Out of 100</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-2">Status</div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(assessment.status)}`}>
              {assessment.status?.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-2">Progress</div>
            <div className="text-2xl font-bold text-raimes-purple">
              {assessment.progressPercentage}%
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalAnswered} of {totalQuestions} answered
            </p>
          </div>

          {/* Started */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Started</div>
            <div className="text-sm font-semibold">{formatDate(assessment.startDate)}</div>
            <p className="text-xs text-gray-500 mt-2">{formatTime(assessment.startDate)}</p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Completed</div>
            <div className="text-sm font-semibold">
              {assessment.completionDate ? formatDate(assessment.completionDate) : "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {assessment.completionDate ? formatTime(assessment.completionDate) : "N/A"}
            </p>
          </div>
        </div>

        {/* Assessment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Assessment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-gray-500">Assessment ID</span>
              <div className="font-semibold text-gray-900">#{assessment.assessmentId}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Questionnaire ID</span>
              <div className="font-semibold text-gray-900">#{assessment.questionnaireId}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Company</span>
              <div className="font-semibold text-gray-900">{assessment.companyName}</div>
            </div>
          </div>
        </div>

        {/* Questions by Category */}
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map(([category, questions]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-raimes-purple to-purple-700 text-white flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{category}</span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {questions.filter((q) => q.answered).length}/{questions.length}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedCategories[category] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Category Content */}
                {expandedCategories[category] && (
                  <div className="p-6 space-y-6 border-t border-gray-200">
                    {questions.map((question, idx) => (
                      <div key={question.questionId} className="border-l-4 border-raimes-purple pl-4 pb-4 last:pb-0 last:border-l-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {idx + 1}. {question.questionText}
                            </h4>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {question.questionType && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  Type: {question.questionType}
                                </span>
                              )}
                              {question.weight && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  Weight: {question.weight}
                                </span>
                              )}
                              {question.evidenceRequired && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  Evidence Required
                                </span>
                              )}
                              {question.answered ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Answered
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  Not Answered
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {question.answered ? (
                          <div className="mt-3 space-y-2">
                            {question.options && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Options:</p>
                                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                  {Array.isArray(question.options)
                                    ? question.options.join(", ")
                                    : typeof question.options === "string"
                                    ? question.options
                                    : JSON.stringify(question.options)}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Answer:</p>
                              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                                <p className="text-gray-900 text-sm">{question.answer || "No response"}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 bg-gray-50 border border-dashed border-gray-300 p-3 rounded">
                            <p className="text-sm text-gray-500 italic">Not answered</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">No questions available</p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-3xl font-bold text-blue-600">{totalQuestions}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Questions Answered</p>
              <p className="text-3xl font-bold text-green-600">{totalAnswered}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-raimes-purple">{assessment.progressPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={() => navigate("/results")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Back to Results
          </button>
          <button
            onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
