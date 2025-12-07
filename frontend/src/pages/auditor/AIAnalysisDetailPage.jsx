import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { api } from "../../services/api";

export default function AIAnalysisDetailPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessmentData, setAssessmentData] = useState(null);

  useEffect(() => {
    fetchAssessmentScoring();
  }, [assessmentId]);

  const fetchAssessmentScoring = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/api/assessments/${assessmentId}/scoring`);

      if (response.data.success) {
        setAssessmentData(response.data.assessment);
      } else {
        setError(response.data.message || "Failed to load assessment data");
      }
    } catch (err) {
      console.error("Error fetching assessment scoring:", err);
      setError(
        err.response?.data?.message || "Failed to load AI analysis details"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (score) => {
    if (score >= 90) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 80) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (score >= 60) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-raimes-purple"></div>
            <span className="ml-4 text-gray-600">Loading AI analysis...</span>
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => navigate("/assessment-results")}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Back to Assessment Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scoring = assessmentData?.scoring;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/assessment-results")}
            className="flex items-center text-raimes-purple hover:text-raimes-yellow mb-4 transition-colors"
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
            Back to Assessment Results
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-4xl font-bold text-raimes-purple mb-2">
              AI Analysis Report
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-semibold text-gray-900">
                  {assessmentData?.companyname}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Questionnaire</p>
                <p className="font-semibold text-gray-900">
                  {assessmentData?.questionnairename}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completion Date</p>
                <p className="font-semibold text-gray-900">
                  {assessmentData?.completiondate
                    ? new Date(assessmentData.completiondate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-br from-raimes-purple to-purple-700 text-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <p className="text-xl mb-2 opacity-90">Overall Score</p>
            <div className="text-7xl font-bold mb-2">
              {scoring?.overall_score?.toFixed(1) || "0.0"}
            </div>
            <p className="text-2xl opacity-90">
              {getScoreLabel(scoring?.overall_score || 0)}
            </p>
          </div>
        </div>

        {/* Detailed Analysis */}
        {scoring?.detailed_analysis && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-raimes-purple mb-4 flex items-center">
              <svg
                className="w-7 h-7 mr-3 text-raimes-yellow"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Detailed Analysis
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {scoring.detailed_analysis}
            </p>
          </div>
        )}

        {/* Category Scores */}
        {scoring?.individual_scores && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-raimes-purple mb-6 flex items-center">
              <svg
                className="w-7 h-7 mr-3 text-raimes-yellow"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Category Breakdown
            </h2>

            <div className="space-y-6">
              {Object.entries(scoring.individual_scores).map(
                ([category, data]) => (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {data.category || category}
                      </h3>
                      <span
                        className={`px-4 py-2 rounded-lg font-bold border ${getCategoryColor(
                          data.score
                        )}`}
                      >
                        {data.score?.toFixed(1)}/100
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className="bg-raimes-purple h-3 rounded-full transition-all duration-500"
                        style={{ width: `${data.score}%` }}
                      ></div>
                    </div>

                    {data.feedback && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-blue-700">
                            Feedback:
                          </span>{" "}
                          {data.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          {scoring?.strengths && scoring.strengths.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center">
                <svg
                  className="w-7 h-7 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Strengths
              </h2>
              <ul className="space-y-3">
                {scoring.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700 bg-green-50 p-3 rounded-lg"
                  >
                    <svg
                      className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {scoring?.weaknesses && scoring.weaknesses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                <svg
                  className="w-7 h-7 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Areas for Improvement
              </h2>
              <ul className="space-y-3">
                {scoring.weaknesses.map((weakness, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700 bg-red-50 p-3 rounded-lg"
                  >
                    <svg
                      className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {scoring?.recommendations && scoring.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-raimes-purple mb-6 flex items-center">
              <svg
                className="w-7 h-7 mr-3 text-raimes-yellow"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI Recommendations
            </h2>
            <div className="space-y-4">
              {scoring.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start bg-purple-50 border-l-4 border-raimes-purple p-4 rounded-r-lg"
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-raimes-purple text-white rounded-full flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed pt-1">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/assessment-results")}
            className="px-6 py-3 border-2 border-raimes-purple text-raimes-purple font-semibold rounded-lg hover:bg-raimes-purple hover:text-white transition-colors"
          >
            Back to Results
          </button>
          <button
            onClick={() => alert("PDF export will be implemented soon")}
            className="px-6 py-3 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
