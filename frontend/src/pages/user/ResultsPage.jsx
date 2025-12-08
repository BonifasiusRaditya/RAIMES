import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { assessmentService } from "../../services/assessmentService";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user's completed assessments
      const response = await assessmentService.getMyAssessments();

      if (response?.success && Array.isArray(response.data)) {
        // Filter only completed assessments
        const completedAssessments = response.data.filter(
          (a) => a.status === "completed" && a.finalScore !== null
        );

        // Map to results format
        const mappedResults = completedAssessments.map((a) => {
          const rawScore = Number(a.finalScore ?? a.calculatedScore ?? 0);
          const score = Number.isFinite(rawScore) ? rawScore : 0;
          const answeredQuestions = Number(a.answeredQuestions ?? 0);
          const totalQuestions = Number(a.totalQuestions ?? 0);
          const rawProgress = Number(a.progressPercentage);
          const progressPercentage = Number.isFinite(rawProgress)
            ? rawProgress
            : totalQuestions > 0
            ? Math.round((answeredQuestions / totalQuestions) * 100)
            : 100;

          return {
            id: a.id,
            assessmentId: a.id,
            questionnaireId: a.questionnaireId,
            title: a.questionnaireTitle || `Assessment ${a.questionnaireId}`,
            completedAt: a.completedAt || a.completionDate || a.startDate,
            score,
            grade: calculateGrade(score),
            category: a.questionnaireDescription || "General Assessment",
            progressPercentage,
            answeredQuestions,
            totalQuestions,
          };
        });

        setResults(mappedResults);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load assessment results");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B+";
    if (score >= 70) return "B";
    if (score >= 60) return "C+";
    if (score >= 50) return "C";
    return "D";
  };

  const getGradeColor = (grade) => {
    if (grade === "A") return "bg-green-100 text-green-800 border-green-300";
    if (grade === "B+") return "bg-blue-100 text-blue-800 border-blue-300";
    if (grade === "B") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (grade === "C+")
      return "bg-orange-100 text-orange-800 border-orange-300";
    if (grade === "C") return "bg-red-100 text-red-800 border-red-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadReport = async (assessmentId) => {
    try {
      // Fetch full assessment details
      const response = await assessmentService.getAssessmentDetail(assessmentId);
      
      if (!response || !response.success) {
        alert("Failed to load assessment details for PDF generation.");
        return;
      }

      const assessment = response.data;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(91, 33, 182);
      doc.text("Assessment Results Report", pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(assessment.questionnaireTitle || "Assessment", pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 15;

      // Assessment Information
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Assessment Information", 14, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Simple text-based info (no autoTable)
      doc.text(`Assessment ID: #${assessment.assessmentId}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Company: ${assessment.companyName}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Status: ${assessment.status?.toUpperCase()}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Final Score: ${assessment.finalScore ? parseFloat(assessment.finalScore).toFixed(1) : 'N/A'}/100`, 14, yPosition);
      yPosition += 5;
      doc.text(`Started: ${formatDate(assessment.startDate)}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Completed: ${assessment.completionDate ? formatDate(assessment.completionDate) : 'N/A'}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Progress: ${assessment.progressPercentage}%`, 14, yPosition);
      yPosition += 5;
      doc.text(`Questions: ${assessment.answeredQuestions}/${assessment.totalQuestions}`, 14, yPosition);
      yPosition += 10;

      // Questions by Category
      const categories = Object.entries(assessment.questionsByCategory || {});
      
      for (const [category, questions] of categories) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(91, 33, 182);
        doc.text(`${category} (${questions.filter(q => q.answered).length}/${questions.length})`, 14, yPosition);
        yPosition += 7;
        doc.setTextColor(0, 0, 0);

        // List questions
        questions.forEach((q, idx) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${idx + 1}. ${q.questionText}`, 14, yPosition);
          yPosition += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          
          if (q.answered) {
            doc.setTextColor(0, 128, 0); // Green
            const answerText = q.answer || 'No response';
            const splitAnswer = doc.splitTextToSize(`Answer: ${answerText}`, pageWidth - 28);
            doc.text(splitAnswer, 18, yPosition);
            yPosition += splitAnswer.length * 5;
          } else {
            doc.setTextColor(255, 0, 0); // Red
            doc.text('Answer: Not answered', 18, yPosition);
            yPosition += 5;
          }
          
          doc.setTextColor(0, 0, 0);
          yPosition += 3;
        });

        yPosition += 5;
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 14, pageHeight - 10, { align: "right" });
      }

      // Save PDF
      const fileName = `Assessment_${assessment.assessmentId}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleViewDetail = (assessmentId) => {
    // Navigate to detailed assessment view
    navigate(`/assessment-detail/${assessmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-raimes-purple"></div>
            <span className="ml-4 text-gray-600">Loading results...</span>
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
                  onClick={fetchResults}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
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
              {results.length > 0
                ? (
                    results.reduce((sum, r) => sum + r.score, 0) /
                    results.length
                  ).toFixed(1)
                : "0.0"}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Highest Score</div>
            <div className="text-3xl font-bold text-green-600">
              {results.length > 0
                ? Math.max(...results.map((r) => r.score)).toFixed(1)
                : "0.0"}
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
                    Completed on {formatDate(result.completedAt)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Assessment ID: {result.assessmentId} | Questionnaire ID:{" "}
                    {result.questionnaireId}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-raimes-purple">
                      {result.score.toFixed(1)}
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
                {/* Progress Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Completion Status
                  </h4>
                  <ul className="space-y-1">
                    <li className="text-sm text-gray-600 pl-7">
                      • Progress: {result.progressPercentage}%
                    </li>
                    <li className="text-sm text-gray-600 pl-7">
                      • Questions Answered: {result.answeredQuestions} /{" "}
                      {result.totalQuestions}
                    </li>
                    <li className="text-sm text-gray-600 pl-7">
                      • Category: {result.category}
                    </li>
                  </ul>
                </div>

                {/* Score Distribution */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 text-raimes-purple mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Performance Rating
                  </h4>
                  <div className="pl-7">
                    <div className="flex items-center mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-raimes-purple h-3 rounded-full transition-all"
                          style={{ width: `${result.score}%` }}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {result.score.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {result.score >= 90
                        ? "Excellent performance"
                        : result.score >= 80
                        ? "Very good performance"
                        : result.score >= 70
                        ? "Good performance"
                        : result.score >= 60
                        ? "Satisfactory performance"
                        : "Needs improvement"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() =>
                    navigate(`/assessment-results/${result.assessmentId}`)
                  }
                  className="bg-raimes-purple hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  View Results
                </button>
                <button
                  onClick={() =>
                    navigate(`/questionnaire/${result.questionnaireId}`)
                  }
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  View Assessment
                </button>
                <button
                  onClick={() => handleDownloadReport(result.assessmentId)}
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
