import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { questionnaireService } from "../../services/questionnaireService";
import { assessmentService } from "../../services/assessmentService";
import Navbar from "../../components/Navbar";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [categorizedQuestionnaires, setCategorizedQuestionnaires] = useState({});
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch questionnaires grouped by category
      try {
        const categoryResponse = await questionnaireService.getQuestionnairesByCategory();
        console.log('📊 Category response:', categoryResponse);
        
        if (categoryResponse && categoryResponse.success) {
          setCategorizedQuestionnaires(categoryResponse.data || {});
          setCategories(categoryResponse.categories || []);
          console.log('✅ Categories loaded:', categoryResponse.categories);
        } else {
          console.warn('⚠️ No categories found or failed response');
          setCategorizedQuestionnaires({});
          setCategories([]);
        }
      } catch (categoryError) {
        console.error('❌ Error fetching categories:', categoryError);
        setCategorizedQuestionnaires({});
        setCategories([]);
      }

      // Fetch user's assessments (same source as MyAssessmentsPage)
      try {
        const myAssessmentsResponse = await assessmentService.getMyAssessments();
        console.log('📋 My assessments response:', myAssessmentsResponse);
        
        if (
          myAssessmentsResponse?.success &&
          Array.isArray(myAssessmentsResponse.data)
        ) {
          // Map API data to the table's expected shape
          const mappedAssessments = myAssessmentsResponse.data.map((a) => ({
            assessmentId: a.id,
            questionnaireId: a.questionnaireId,
            questionnaireTitle:
              a.questionnaireTitle || `Questionnaire ${a.questionnaireId}`,
            questionnaireDescription: a.questionnaireDescription || "",
            progressPercentage: a.progressPercentage ?? 0,
            answeredQuestions: a.answeredQuestions ?? 0,
            totalQuestions: a.totalQuestions ?? 0,
            status:
              a.status === "in_progress"
                ? "in-progress"
                : a.status || "in-progress",
            finalScore: a.finalScore ?? null,
            startDate: a.startDate || null,
          }));

          setAssessments(mappedAssessments);

          // Derive stats from mapped assessments
          setStats({
            total: mappedAssessments.length,
            inProgress: mappedAssessments.filter(
              (a) => a.status === "in-progress"
            ).length,
            completed: mappedAssessments.filter((a) => a.status === "completed")
              .length,
            pending: mappedAssessments.filter(
              (a) => a.status === "pending-review" || a.status === "pending"
            ).length,
          });
          console.log('✅ Assessments loaded:', mappedAssessments.length);
        } else {
          console.warn('⚠️ No assessments found');
          setAssessments([]);
          setStats({ total: 0, inProgress: 0, completed: 0, pending: 0 });
        }
      } catch (assessmentError) {
        console.error('❌ Error fetching assessments:', assessmentError);
        setAssessments([]);
        setStats({ total: 0, inProgress: 0, completed: 0, pending: 0 });
      }
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async (questionnaire) => {
    try {
      console.log('Starting assessment for:', questionnaire);
      
      // questionnaireid is now a category string, not a number
      const questionnaireId = questionnaire.questionnaireid;

      // Check if assessment already exists for this category
      const existingAssessment = assessments.find(
        (a) => String(a.questionnaireId) === String(questionnaireId)
      );

      if (existingAssessment) {
        // Continue existing assessment
        window.location.href = `/questionnaire/${questionnaireId}`;
      } else {
        // Start new assessment with category as ID
        const response = await assessmentService.startAssessment(questionnaireId);
        if (response.success) {
          window.location.href = `/questionnaire/${questionnaireId}`;
        } else {
          alert("Failed to start assessment: " + response.message);
        }
      }
    } catch (err) {
      console.error("Error starting assessment:", err);
      alert("Failed to start assessment: " + (err.message || "Unknown error"));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      approved: "bg-purple-100 text-purple-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.username || "User"}
          </h1>
          <p className="mt-2 text-gray-600">
            Track your maturity assessments and manage your submissions
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border-l-4 border-raimes-purple p-6">
            <div className="flex items-center">
              <div className="shrink-0 bg-purple-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-raimes-purple"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Assessments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-raimes-yellow p-6">
            <div className="flex items-center">
              <div className="shrink-0 bg-yellow-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-raimes-yellow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-6">
            <div className="flex items-center">
              <div className="shrink-0 bg-blue-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-6">
            <div className="flex items-center">
              <div className="shrink-0 bg-green-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Questionnaires by Category */}
        <div className="bg-white rounded-lg shadow-md border-t-4 border-raimes-purple mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
            <h2 className="text-xl font-bold text-raimes-purple">
              Available Assessments by Category
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Start a new maturity assessment organized by categories
            </p>
          </div>

          <div className="p-6">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No assessments available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Check back later for new assessments.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((category) => (
                  <div key={category} className="border-l-4 border-raimes-purple pl-4">
                    <h3 className="text-lg font-bold text-raimes-purple mb-4 capitalize">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categorizedQuestionnaires[category]?.map((questionnaire) => {
                        const existingAssessment = assessments.find(
                          (a) => a.questionnaireId === questionnaire.questionnaireid
                        );

                        return (
                          <div
                            key={questionnaire.questionnaireid}
                            className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-xl hover:border-raimes-purple transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 flex-1">
                                {questionnaire.title}
                              </h4>
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-raimes-purple rounded-full">
                                {questionnaire.question_count} questions
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {questionnaire.description || "No description available"}
                            </p>

                            <div className="space-y-2 mb-4">
                              {questionnaire.standard && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <svg
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                  </svg>
                                  Standard: {questionnaire.standard}
                                </div>
                              )}
                              {existingAssessment && (
                                <div className="flex items-center text-sm text-blue-600">
                                  <svg
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Progress: {existingAssessment.progressPercentage}%
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleStartAssessment(questionnaire)}
                              className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
                                existingAssessment
                                  ? "bg-raimes-purple text-white hover:opacity-90"
                                  : "bg-raimes-yellow text-gray-900 hover:opacity-90"
                              }`}
                            >
                              {existingAssessment
                                ? "Continue Assessment"
                                : "Start Assessment"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* My Assessments (In Progress & Completed) */}
        <div className="bg-white rounded-lg shadow-md border-t-4 border-raimes-yellow">
          <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
            <h2 className="text-xl font-bold text-raimes-yellow">
              My Assessments
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              View and continue your assessments
            </p>
          </div>

          <div className="p-6">
            {assessments.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No assessments yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start your first assessment from the available assessments
                  above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-raimes-purple uppercase tracking-wider">
                        Assessment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-raimes-purple uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-raimes-purple uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-raimes-purple uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-raimes-purple uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-raimes-purple uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assessments.map((assessment) => (
                      <tr
                        key={assessment.assessmentId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {assessment.questionnaireTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assessment.questionnaireDescription}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                              assessment.status
                            )}`}
                          >
                            {assessment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-raimes-purple h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    assessment.progressPercentage || 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {assessment.progressPercentage || 0}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {assessment.answeredQuestions}/
                            {assessment.totalQuestions} completed
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assessment.finalScore
                            ? `${assessment.finalScore}/100`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(assessment.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {assessment.status === "completed" ? (
                            <button
                              className="text-raimes-purple hover:opacity-80 font-medium"
                              onClick={() =>
                                alert("View results feature coming soon!")
                              }
                            >
                              View Results
                            </button>
                          ) : (
                            <button
                              className="text-raimes-yellow hover:opacity-80 font-medium"
                              onClick={() =>
                                (window.location.href = `/questionnaire/${assessment.questionnaireId}`)
                              }
                            >
                              Continue ({assessment.progressPercentage || 0}%)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-purple-50 border-2 border-raimes-purple rounded-lg p-6">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-6 w-6 text-raimes-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-raimes-purple">
                Need Help?
              </h3>
              <div className="mt-2 text-sm text-gray-700">
                <p>
                  If you need assistance with your assessment or have questions,
                  please contact your administrator or check the help
                  documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
