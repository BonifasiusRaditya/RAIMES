import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { assessmentService } from "../../services/assessmentService";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    averageProgress: 0,
    invalidData: 0,
    notifications: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Fetching dashboard data...');
      const response = await assessmentService.getAllAssessments();
      console.log('📊 Dashboard response:', response);
      
      if (response.success) {
        const assessmentData = response.data || [];
        console.log('✅ Assessment data received:', assessmentData);
        setAssessments(assessmentData);
        
        // Calculate stats from real data
        const totalAssessments = assessmentData.length;
        const inProgress = assessmentData.filter(a => a.status === 'in_progress').length;
        const completed = assessmentData.filter(a => a.status === 'completed').length;
        const averageProgress = totalAssessments > 0 
          ? Math.round(assessmentData.reduce((sum, a) => sum + (a.progressPercentage || 0), 0) / totalAssessments)
          : 0;
        
        setStats({
          total: totalAssessments,
          inProgress,
          completed,
          averageProgress,
          invalidData: Math.floor(Math.random() * 3), // TODO: implement real validation
          notifications: 0 // TODO: implement real notifications
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'submitted': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Submitted' },
      'review': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Review' }
    };
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return { ...badge, label: badge.label };
  };

  const getActionButton = (assessment) => {
    if (assessment.status === 'completed') {
      return {
        style: 'yellow-outline',
        action: 'Approved',
        disabled: false
      };
    } else if (assessment.status === 'submitted' || assessment.progressPercentage >= 100) {
      return {
        style: 'yellow',
        action: 'Review',
        disabled: false
      };
    } else {
      return {
        style: 'gray',
        action: 'Pending',
        disabled: true
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-4 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="xl:mx-20 xl:px-16 py-8 mx-4 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.username || "User"}
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of all assessments under your supervision.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md border-l-4 border-raimes-purple p-6 mb-6">
            <h2 className="text-xl font-semibold text-raimes-purple mb-4">
              Assessment Progress
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-raimes-yellow h-4 rounded-full transition-all duration-300"
                  style={{ width: `${stats.averageProgress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-raimes-purple">
              {stats.completed} out of {stats.total} assessments completed
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Average progress: {stats.averageProgress}%
            </p>
          </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mb-8">
          <a href="/data-validation" className="bg-white rounded-lg shadow-md border-l-4 border-raimes-red p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="shrink-0 bg-red-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-raimes-red"
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
                <p className="text-sm font-medium text-gray-600">Validate Questionnaires</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.invalidData}
                </p>
                <p className="text-xs text-gray-500 mt-1">Review & approve answers</p>
              </div>
            </div>
          </a>

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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.notifications}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-raimes-red px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-raimes-purple text-white">
                <th className="px-6 py-4 text-left font-semibold">No</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Company/User Name
                </th>
                <th className="px-6 py-4 text-left font-semibold">Questionnaire</th>
                <th className="px-6 py-4 text-left font-semibold">Progress</th>
                <th className="px-6 py-4 text-left font-semibold">Score</th>
                <th className="px-6 py-4 text-left font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Loading assessments...' : 'No assessments found'}
                  </td>
                </tr>
              ) : (
                assessments.map((assessment, index) => {
                  return (
                    <tr
                      key={assessment.assessmentId}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-raimes-purple">{index + 1}</td>
                      <td className="px-6 py-4 text-raimes-purple font-medium">
                        {assessment.entityName}
                        <div className="text-xs text-gray-500">
                          {assessment.entityType === 'company' ? 'Company' : 'User'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-raimes-purple text-sm">
                        {assessment.questionnaireTitle}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                            <div
                              className="bg-raimes-yellow h-2 rounded-full transition-all duration-300"
                              style={{ width: `${assessment.progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className={`font-medium ${getProgressColor(assessment.progressPercentage)}`}>
                            {assessment.progressPercentage}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {assessment.answeredQuestions}/{assessment.totalQuestions} answered
                        </div>
                      </td>
                      <td className="px-6 py-4 text-raimes-purple font-bold text-lg">
                        {assessment.finalScore !== null && assessment.finalScore !== undefined ? assessment.finalScore : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={`/data-validation?assessmentId=${assessment.assessmentId}`}
                          className="inline-block px-6 py-2 bg-raimes-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          View Detail
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
