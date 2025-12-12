import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { assessmentService } from "../../services/assessmentService";
import jsPDF from "jspdf/dist/jspdf.es.min.js";

export default function AssessmentResultsPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [questionEvidence, setQuestionEvidence] = useState({});
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");

  useEffect(() => {
    fetchAssessmentDetail();
  }, [assessmentId]);

  const fetchEvidence = async (id) => {
    try {
      setEvidenceLoading(true);
      setEvidenceError("");
      const evidenceResponse = await assessmentService.getEvidence(id);
      if (evidenceResponse && evidenceResponse.success) {
        const byQuestion = evidenceResponse.data?.byQuestion || {};
        setQuestionEvidence(byQuestion);
      } else {
        setQuestionEvidence({});
        setEvidenceError(evidenceResponse?.message || "Failed to load evidence");
      }
    } catch (err) {
      console.error("Error fetching evidence:", err);
      const errorMsg =
        typeof err === "string"
          ? err
          : err.response?.data?.message || err.message || "Failed to load evidence";
      setEvidenceError(errorMsg);
      setQuestionEvidence({});
    } finally {
      setEvidenceLoading(false);
    }
  };

  const fetchAssessmentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await assessmentService.getAssessmentDetail(assessmentId);

      if (response && response.success) {
        const data = response.data || {};
        let parsedQuestionNotes = {};

        if (data.questionReviewerNotes) {
          try {
            parsedQuestionNotes =
              typeof data.questionReviewerNotes === "string"
                ? JSON.parse(data.questionReviewerNotes)
                : data.questionReviewerNotes;
          } catch (parseErr) {
            console.error("Failed parsing question reviewer notes:", parseErr);
            parsedQuestionNotes = {};
          }
        }

        const normalizedFinalScore =
          data.finalScore !== null && data.finalScore !== undefined && !Number.isNaN(Number(data.finalScore))
            ? Number(data.finalScore)
            : null;

        setAssessment({
          ...data,
          finalScore: normalizedFinalScore,
          reviewerNotes: data.reviewerNotes || "",
          questionReviewerNotes: parsedQuestionNotes || {},
        });
        // Expand all categories by default
        const categories = Object.keys(response.data.questionsByCategory || {});
        const expanded = {};
        categories.forEach(cat => expanded[cat] = true);
        setExpandedCategories(expanded);
        fetchEvidence(assessmentId);
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
    if (score === null || score === undefined || Number.isNaN(score)) return "text-gray-600";
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
    try {
      if (!assessment) {
        alert("Assessment data not loaded yet. Please wait.");
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(91, 33, 182); // Purple color
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
      
      // Simple text-based info (avoiding autoTable for now)
      doc.text(`Assessment ID: #${assessment.assessmentId}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Questionnaire ID: #${assessment.questionnaireId}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Company: ${assessment.companyName}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Status: ${assessment.status?.toUpperCase()}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Started: ${formatDate(assessment.startDate)}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Completed: ${assessment.completionDate ? formatDate(assessment.completionDate) : 'N/A'}`, 14, yPosition);
      yPosition += 5;
      const pdfFinalScore =
        assessment.finalScore !== null && assessment.finalScore !== undefined && !Number.isNaN(assessment.finalScore)
          ? assessment.finalScore.toFixed(1)
          : "N/A";
      doc.text(`Final Score: ${pdfFinalScore}/100`, 14, yPosition);
      yPosition += 5;
      doc.text(`Progress: ${assessment.progressPercentage}%`, 14, yPosition);
      yPosition += 10;

      // Summary Statistics
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Total Questions: ${assessment.totalQuestions || 0}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Questions Answered: ${assessment.answeredQuestions || 0}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Completion Rate: ${assessment.progressPercentage}%`, 14, yPosition);
      yPosition += 10;

      // Questions by Category
      const categories = Object.entries(assessment.questionsByCategory || {});
      
      for (const [category, questions] of categories) {
        // Check if need new page
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

      // Footer on last page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
        doc.text(
          `Generated on ${new Date().toLocaleDateString()}`,
          pageWidth - 14,
          pageHeight - 10,
          { align: "right" }
        );
      }

      // Save PDF
      const fileName = `Assessment_${assessment.assessmentId}_${assessment.questionnaireTitle?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error.message}. Please try again.`);
    }
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
  const questionNotes = assessment.questionReviewerNotes || {};
  const hasOverallNotes = Boolean(assessment.reviewerNotes && assessment.reviewerNotes.trim().length > 0);
  const hasQuestionNotes = Object.values(questionNotes).some((note) => Boolean(note && note.toString().trim().length > 0));
  const hasAnyReviewerNotes = hasOverallNotes || hasQuestionNotes;
  const hasAnyEvidence = Object.values(questionEvidence || {}).some(
    (items) => Array.isArray(items) && items.length > 0
  );

  const readQuestionNote = (questionId) => {
    if (!questionNotes) return "";
    return questionNotes[questionId] || questionNotes[String(questionId)] || "";
  };

  const readQuestionEvidence = (questionId) => {
    if (!questionEvidence) return [];
    return (
      questionEvidence[questionId] ||
      questionEvidence[String(questionId)] ||
      []
    );
  };

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
              {assessment.finalScore !== null && assessment.finalScore !== undefined && !Number.isNaN(assessment.finalScore)
                ? assessment.finalScore.toFixed(1)
                : "N/A"}
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

        {/* Reviewer Notes */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Reviewer Feedback</h2>
          {hasAnyReviewerNotes ? (
            <div className="space-y-4">
              {hasOverallNotes && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-raimes-purple mb-1">Overall Notes</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {assessment.reviewerNotes.trim()}
                  </p>
                </div>
              )}
              {hasQuestionNotes && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Question-Specific Notes</p>
                  <p className="text-xs text-gray-600">
                    Detailed notes are displayed alongside each relevant question below.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-600">
              No reviewer feedback available yet. You will see notes here once an auditor completes the review.
            </div>
          )}
        </div>

        {evidenceLoading && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-600">
            Loading evidence files...
          </div>
        )}

        {!evidenceLoading && evidenceError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {evidenceError}
          </div>
        )}

        {!evidenceLoading && !evidenceError && !hasAnyEvidence && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-600">
            No evidence files were uploaded for this assessment.
          </div>
        )}

        {/* Questions by Category */}
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map(([category, questions]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 bg-linear-to-r from-raimes-purple to-purple-700 text-white flex justify-between items-center hover:shadow-md transition-shadow"
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
                    {questions.map((question, idx) => {
                      const evidenceList = readQuestionEvidence(question.questionId);
                      const hasEvidenceForQuestion = Array.isArray(evidenceList) && evidenceList.length > 0;
                      const questionNote = readQuestionNote(question.questionId);
                      const trimmedNote = questionNote?.toString().trim();

                      return (
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
                          <div className="mt-3 space-y-3">
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
                            {trimmedNote && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Reviewer Note:</p>
                                <div className="bg-purple-50 border-l-4 border-raimes-purple p-3 rounded">
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{trimmedNote}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 bg-gray-50 border border-dashed border-gray-300 p-3 rounded">
                            <p className="text-sm text-gray-500 italic">Not answered</p>
                          </div>
                        )}

                        {(hasEvidenceForQuestion || (!evidenceLoading && question.evidenceRequired)) && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Evidence Files:</p>
                            {evidenceLoading ? (
                              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-500">
                                Loading evidence...
                              </div>
                            ) : hasEvidenceForQuestion ? (
                              <div className="space-y-2">
                                {evidenceList.map((file) => (
                                  <a
                                    key={file.id}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:border-raimes-purple hover:text-raimes-purple transition-colors"
                                  >
                                    <span className="text-sm font-medium truncate pr-3">{file.filename}</span>
                                    <span className="text-xs text-gray-500">
                                      {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ""}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-gray-50 border border-dashed border-gray-300 rounded p-3 text-sm text-gray-500">
                                No evidence uploaded for this question.
                              </div>
                            )}
                          </div>
                        )}
                        </div>
                      );
                    })}
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
