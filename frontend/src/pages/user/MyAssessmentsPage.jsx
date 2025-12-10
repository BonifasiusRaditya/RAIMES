import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { assessmentService } from "../../services/assessmentService";

export default function MyAssessmentsPage() {
  const navigate = useNavigate();
  const [assessmentsByCategory, setAssessmentsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, in-progress, completed, pending

  useEffect(() => {
    let isMounted = true;
    const loadAssessments = async () => {
      try {
        setLoading(true);
        const response = await assessmentService.getMyAssessmentsByCategory();
        
        if (isMounted) {
          setAssessmentsByCategory(response || {});
        }
      } catch (error) {
        console.error("Error loading assessments:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssessments();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get all assessments flattened
  const allAssessments = Object.values(assessmentsByCategory).flat();

  // Filter assessments by status
  const filteredCategories = Object.keys(assessmentsByCategory).reduce((acc, category) => {
    const filtered = assessmentsByCategory[category].filter((a) => {
      if (filter === "all") return true;
      if (filter === "pending") return a.status === "pending-review";
      return a.status === filter;
    });
    
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  const handleContinueAssessment = (questionnaireId) => {
    navigate(`/assessment/${questionnaireId}`);
  };

  const handleViewResults = (assessmentId) => {
    navigate(`/assessment/results/${assessmentId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-800" },
      "completed": { label: "Completed", color: "bg-green-100 text-green-800" },
      "pending-review": { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
      "not-started": { label: "Not Started", color: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || statusConfig["not-started"];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-raimes-purple"></div>
            <p className="mt-2 text-gray-600">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Assessments
          </h1>
          <p className="text-gray-600">
            Track and manage your mining assessment questionnaires
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Total Assessments</div>
            <div className="text-3xl font-bold text-raimes-purple">
              {allAssessments.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-blue-600">
              {allAssessments.filter((a) => a.status === "in-progress").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-600">
              {allAssessments.filter((a) => a.status === "completed").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-600">
              {allAssessments.filter((a) => a.status === "pending-review").length}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-10">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <div className="flex gap-2 flex-wrap">
              {[
                ["all", "All"],
                ["in-progress", "In Progress"],
                ["completed", "Completed"],
                ["pending", "Pending Review"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === value
                      ? "bg-raimes-purple text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grouped Sections by Category */}
        <div className="space-y-12">
          {Object.keys(filteredCategories).map((category) => {
            const list = filteredCategories[category];
            return (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2 bg-raimes-purple"></span>
                  {category}{" "}
                  <span className="ml-2 text-sm text-gray-500">
                    ({list.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {list.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="pr-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {a.title}
                          </h3>
                          <div className="text-xs text-gray-500 flex gap-4 flex-wrap">
                            {a.startedAt && <span>Started: {a.startedAt}</span>}
                            {a.lastUpdated && (
                              <span>Updated: {a.lastUpdated}</span>
                            )}
                            {a.completedAt && (
                              <span>Completed: {a.completedAt}</span>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(a.status)}
                      </div>
                      {a.status !== "not-started" && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{a.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-raimes-purple h-2 rounded-full transition-all"
                              style={{ width: `${a.progress}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-[11px] text-gray-500">
                            {a.answeredQuestions}/{a.totalQuestions} answered
                          </div>
                        </div>
                      )}
                      {(a.score || a.grade) && (
                        <div className="flex gap-6 text-sm mb-3">
                          {a.score && (
                            <div className="text-gray-700">
                              Score:{" "}
                              <span className="font-semibold text-raimes-purple">
                                {a.score}
                              </span>
                            </div>
                          )}
                          {a.grade && (
                            <div className="text-gray-700">
                              Grade:{" "}
                              <span className="font-semibold text-raimes-purple">
                                {a.grade}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {a.status === "in-progress" && (
                          <button
                            onClick={() =>
                              handleContinueAssessment(a.questionnaireId)
                            }
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                          >
                            Continue
                          </button>
                        )}
                        {a.status === "not-started" && (
                          <button
                            onClick={() =>
                              handleContinueAssessment(a.questionnaireId)
                            }
                            className="px-4 py-2 bg-raimes-purple hover:opacity-90 text-white text-sm font-medium rounded-lg"
                          >
                            Start
                          </button>
                        )}
                        {a.status === "completed" && (
                          <button
                            onClick={() => handleViewResults(a.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
                          >
                            View Results
                          </button>
                        )}
                        {a.status === "pending-review" && (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed"
                          >
                            Awaiting Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(filteredCategories).length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center mt-8">
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
            <p className="text-gray-500">
              No assessments found for this filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}