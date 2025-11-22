import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { assessmentService } from "../../services/assessmentService";
import { useAuth } from "../../context/AuthContext";
import warningIcon from "../../assets/warning-icon.png";
import bellIcon from "../../assets/bell-icon.png";
import plusIcon from "../../assets/plus-icon.png";

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

      <main className="px-8 py-8">
        <h1 className="text-4xl font-bold text-raimes-purple mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-8 shadow">
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

          <div className="bg-white rounded-2xl p-8 shadow flex items-center justify-center gap-6">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 bg-raimes-purple rounded-full flex items-center justify-center">
                <img src={warningIcon} alt="Warning Icon" className="h-10 w-10" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-raimes-purple">{stats.invalidData}</div>
              <div className="text-raimes-purple font-semibold">
                Data validation issues
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow flex items-center justify-center gap-6">
            <div className="h-20 w-20 bg-raimes-purple rounded-full flex items-center justify-center">
              <img src={bellIcon} alt="Bell Icon" className="h-16 w-16" />
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-raimes-purple">{stats.notifications}</div>
              <div className="text-raimes-purple font-semibold">
                Notifications
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-2xl p-8 shadow flex items-center justify-center gap-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = '/admin/add-account'}
          >
            <div className="h-20 w-20 bg-raimes-purple rounded-full flex items-center justify-center">
              <img src={plusIcon} alt="Plus Icon" className="h-10 w-10" />
            </div>
            <div className="text-center">
              <div className="text-3xltext-raimes-purple font-semibold">
                Add New User
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Score</th>
                <th className="px-6 py-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Loading assessments...' : 'No assessments found'}
                  </td>
                </tr>
              ) : (
                assessments.map((assessment, index) => {
                  const statusBadge = getStatusBadge(assessment.status);
                  const actionBtn = getActionButton(assessment);
                  
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
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-raimes-purple font-bold text-lg">
                        {assessment.finalScore || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {actionBtn.style === "yellow" && (
                          <button 
                            className="px-6 py-2 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            disabled={actionBtn.disabled}
                          >
                            {actionBtn.action}
                          </button>
                        )}
                        {actionBtn.style === "yellow-outline" && (
                          <button className="px-6 py-2 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white transition-colors">
                            {actionBtn.action}
                          </button>
                        )}
                        {actionBtn.style === "gray" && (
                          <button className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed">
                            {actionBtn.action}
                          </button>
                        )}
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
