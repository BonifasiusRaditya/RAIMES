import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockResults = [
      {
        id: 2,
        title: "Safety & Compliance Assessment Q4 2025",
        completedAt: "2025-10-28",
        score: 87.5,
        grade: "B+",
        category: "Safety",
        strengths: ["Strong safety protocols", "Excellent incident reporting"],
        improvements: [
          "PPE compliance can be improved",
          "Emergency drills frequency",
        ],
      },
      {
        id: 5,
        title: "Environmental Impact Assessment Q3 2025",
        completedAt: "2025-09-15",
        score: 92.3,
        grade: "A",
        category: "Environment",
        strengths: [
          "Excellent waste management",
          "Water conservation practices",
          "Carbon footprint reduction",
        ],
        improvements: ["Biodiversity monitoring"],
      },
      {
        id: 8,
        title: "Labor Standards Assessment Q2 2025",
        completedAt: "2025-06-20",
        score: 78.9,
        grade: "B",
        category: "Labor",
        strengths: ["Fair wages", "Good working conditions"],
        improvements: [
          "Training programs need expansion",
          "Worker feedback mechanisms",
        ],
      },
    ];

    setTimeout(() => {
      setResults(mockResults);
      setLoading(false);
    }, 500);
  }, []);

  const getGradeColor = (grade) => {
    if (grade === "A") return "bg-green-100 text-green-800 border-green-300";
    if (grade === "B+") return "bg-blue-100 text-blue-800 border-blue-300";
    if (grade === "B") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const handleDownloadReport = (resultId) => {
    // Implement PDF download logic
    alert(`Downloading report for assessment ${resultId}...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading results...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Assessment Results
          </h1>
          <p className="text-gray-600">
            Review your completed assessment results and performance metrics
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Average Score</div>
            <div className="text-3xl font-bold text-raimes-purple">
              {(
                results.reduce((sum, r) => sum + r.score, 0) / results.length
              ).toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Highest Score</div>
            <div className="text-3xl font-bold text-green-600">
              {Math.max(...results.map((r) => r.score))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">
              Completed Assessments
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {results.length}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-6">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Completed on {result.completedAt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-raimes-purple">
                      {result.score}
                    </div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                  {result.grade && (
                    <span
                      className={`px-4 py-2 rounded-lg text-lg font-bold border ${getGradeColor(
                        result.grade
                      )}`}
                    >
                      {result.grade}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Strengths */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 text-green-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {result.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-600 pl-7">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 text-yellow-600 mr-2"
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
                  </h4>
                  <ul className="space-y-1">
                    {result.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-sm text-gray-600 pl-7">
                        • {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/assessment-result/${result.id}`)}
                  className="bg-raimes-purple hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  View Detailed Report
                </button>
                <button
                  onClick={() => handleDownloadReport(result.id)}
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
          ))}
        </div>

        {results.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 mb-4">No completed assessments yet</p>
            <button
              onClick={() => navigate("/my-assessments")}
              className="bg-raimes-purple hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Start an Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
