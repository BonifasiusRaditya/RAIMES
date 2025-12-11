import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { questionService } from "../../services/questionService";
import { assessmentService } from "../../services/assessmentService";
import { useAuth } from "../../context/AuthContext";

function QuestionnairePage() {
    // State for category pagination
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [categories, setCategories] = useState([]);

  const { id: questionnaireId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questionnaire, setQuestionnaire] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const totalQuestions = questions.length;

  useEffect(() => {
    if (questionnaireId) {
      setAnswers({});
      setFiles({});
      setSubmitting(false);
      setError("");
      startAssessmentAndLoadQuestions();
    }
  }, [questionnaireId]);

  const startAssessmentAndLoadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 User data:", user);
      console.log("📋 Starting assessment for questionnaire:", questionnaireId);

      // First, check if assessment already exists
      const currentAssessment = await assessmentService.getCurrentAssessment(
        questionnaireId
      );

      let assessmentData;
      let shouldResume = false;

      if (currentAssessment && currentAssessment.success) {
        // Assessment exists, use it
        assessmentData = currentAssessment.data;
        shouldResume = true;
        console.log("📊 Found existing assessment:", assessmentData);
      } else {
        // No assessment exists, create new one
        const assessmentResponse = await assessmentService.startAssessment(
          questionnaireId
        );
        console.log("📊 Assessment response:", assessmentResponse);

        if (!assessmentResponse.success) {
          setError(
            `Failed to start assessment: ${
              assessmentResponse.message || "Unknown error"
            }`
          );
          return;
        }
        assessmentData = assessmentResponse.data;
      }

      // Set assessment data
      const assessmentIdValue =
        assessmentData.assessmentId || assessmentData.id;
      setAssessmentId(assessmentIdValue);
      setProgressPercentage(assessmentData.progressPercentage || 0);
      const existingAnswerMap =
        assessmentData.answers || assessmentData.answerMap || {};
      console.log("🎯 Assessment data:", {
        assessmentId: assessmentIdValue,
        progress: assessmentData.progressPercentage || 0,
        answered: assessmentData.answeredQuestions?.length || 0,
        total: assessmentData.totalQuestions || 24,
        shouldResume,
        nextIndex: assessmentData.nextQuestionIndex,
      });

      // Then load questions
      const response = await questionService.getQuestionsByQuestionnaireId(
        questionnaireId
      );

      // Debug: log received questions
      console.log('Received questions:', response.data?.length);
      if (response.data?.length > 0) {
        console.log('First question:', response.data[0]);
        console.log('First question options:', response.data[0].options);
      }

      if (response.success && response.data) {
        setQuestions(response.data);
        // Extract unique categories from questions
        const uniqueCategories = Array.from(new Set(response.data.map(q => q.category)));
        setCategories(uniqueCategories);
        setCategoryIndex(0);
        setQuestionnaire({
          id: questionnaireId,
          title: `Mining Assessment Questionnaire ${questionnaireId}`,
          description: "Complete assessment for responsible mining practices",
        });

        // Initialize empty answers and files for all questions
        const initialAnswers = {};
        const initialFiles = {};
        response.data.forEach((q) => {
          // Get the correct question ID field
          const rawId = q.questionID || q.questionid || q.id;
          if (rawId !== undefined && rawId !== null) {
            const normalizedId = Number(rawId);
            const key = Number.isNaN(normalizedId) ? rawId : normalizedId;

            const existingAnswer =
              existingAnswerMap[key] ??
              existingAnswerMap[String(key)] ??
              existingAnswerMap[rawId] ??
              "";

            initialAnswers[key] = existingAnswer ?? "";
            initialFiles[key] = [];
          }
        });
        setAnswers(initialAnswers);
        setFiles(initialFiles);

        console.log("✅ Assessment loaded:", {
          assessmentId: assessmentIdValue,
          questions: response.data.length,
          resuming: shouldResume,
          progress: assessmentData.progressPercentage || 0,
        });
      } else {
        setError("No questions found for this questionnaire.");
      }
    } catch (err) {
      console.error("❌ Error starting assessment:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please login again.");
      } else if (err.response?.status === 404) {
        setError("Questionnaire not found.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          `Failed to start assessment: ${
            err.response?.data?.message || err.message || "Please try again."
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: answer,
      };
      console.log(`📝 Answer updated for question ${questionId}:`, answer);
      console.log("📋 All answers now:", newAnswers);
      return newAnswers;
    });
  };

  const handleFileChange = (e, questionId) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), ...selectedFiles],
    }));
  };

  const handleDrop = (e, questionId) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), ...droppedFiles],
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSaveAnswer = async (questionId) => {
    try {
      const effectiveAssessmentId = assessmentId || questionnaireId;
      if (!effectiveAssessmentId) {
        setNotification({
          show: true,
          message: "Unable to save. Assessment not initialized.",
          type: "error",
        });
        setTimeout(
          () => setNotification({ show: false, message: "", type: "" }),
          3000
        );
        return;
      }

      const answerToPersist = answers[questionId] || "";
      const filesToSave = files[questionId] || [];

      await assessmentService.saveProgress({
        assessmentId: effectiveAssessmentId,
        questionId: questionId,
        answer: typeof answerToPersist === "string" ? answerToPersist : answerToPersist.toString(),
        files: filesToSave,
      });

      setNotification({
        show: true,
        message: "Answer saved successfully!",
        type: "success",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "" }),
        2000
      );
    } catch (error) {
      console.error("Error saving answer:", error);
      setNotification({
        show: true,
        message: "Failed to save answer. Please try again.",
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "" }),
        3000
      );
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      setSubmitting(true);

      // Check if all questions have been answered
      const unansweredQuestions = questions.filter((q) => {
        const qId = q.questionID || q.questionid || q.id;
        const rawAnswerValue = answers[qId];
        const hasAnswer =
          typeof rawAnswerValue === "number"
            ? !Number.isNaN(rawAnswerValue)
            : (rawAnswerValue ?? "").toString().trim().length > 0;
        const hasFiles = files[qId]?.length > 0;
        return !hasAnswer && !hasFiles;
      });

      if (unansweredQuestions.length > 0) {
        setNotification({
          show: true,
          message: `Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`,
          type: "warning",
        });
        setTimeout(
          () => setNotification({ show: false, message: "", type: "" }),
          5000
        );
        setSubmitting(false);
        return;
      }

      const effectiveAssessmentId = assessmentId || questionnaireId;

      if (!effectiveAssessmentId) {
        setNotification({
          show: true,
          message:
            "Unable to submit because the assessment session is missing. Please reload the questionnaire and try again.",
          type: "error",
        });
        setTimeout(
          () => setNotification({ show: false, message: "", type: "" }),
          5000
        );
        return;
      }

      // Persist every answer to ensure backend has the latest responses
      try {
        for (const question of questions) {
          const questionIdValue =
            question?.questionID || question?.questionid || question?.id;

          if (questionIdValue === undefined || questionIdValue === null) {
            continue;
          }

          const normalizedQuestionId = Number(questionIdValue);

          if (Number.isNaN(normalizedQuestionId)) {
            console.warn(
              "Skipping question with non-numeric identifier during submit:",
              questionIdValue
            );
            continue;
          }

          const preSubmitRawAnswer =
            answers[normalizedQuestionId] ??
            answers[questionIdValue] ??
            "";
          const preSubmitAnswer =
            typeof preSubmitRawAnswer === "string"
              ? preSubmitRawAnswer
              : preSubmitRawAnswer != null
              ? preSubmitRawAnswer.toString()
              : "";

          await assessmentService.saveProgress({
            assessmentId: effectiveAssessmentId,
            questionId: normalizedQuestionId,
            answer: preSubmitAnswer,
            files:
              files[normalizedQuestionId] || files[questionIdValue] || [],
          });
        }
      } catch (saveError) {
        console.error("❌ Error saving answers before submission:", saveError);
        setNotification({
          show: true,
          message:
            saveError?.response?.data?.message ||
            saveError?.message ||
            "Failed to store answers before submitting. Please try again.",
          type: "error",
        });
        setTimeout(
          () => setNotification({ show: false, message: "", type: "" }),
          5000
        );
        setSubmitting(false);
        return;
      }

      // Use the new completeAssessment endpoint
      const response = await assessmentService.completeAssessment(
        questionnaireId
      );

      if (response.success) {
        setNotification({
          show: true,
          message: `Assessment completed successfully! Score: ${response.data.finalScore}. Redirecting...`,
          type: "success",
        });
        setTimeout(() => {
          setNotification({ show: false, message: "", type: "" });
          navigate("/results");
        }, 2000);
      } else {
        setNotification({
          show: true,
          message: `Submission failed: ${response.message || "Unknown error"}`,
          type: "error",
        });
        setTimeout(
          () => setNotification({ show: false, message: "", type: "" }),
          5000
        );
      }
    } catch (error) {
      console.error("❌ Error submitting assessment:", error);
      setNotification({
        show: true,
        message: `Failed to submit assessment: ${
          error.response?.data?.message || error.message || "Please try again."
        }`,
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "" }),
        5000
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading questions...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Questionnaire
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startAssessmentAndLoadQuestions}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 pt-4 animate-slide-down">
          <div
            className={`rounded-lg shadow-xl p-4 ${
              notification.type === "success"
                ? "bg-green-50 border-l-4 border-green-500"
                : notification.type === "error"
                ? "bg-red-50 border-l-4 border-red-500"
                : "bg-yellow-50 border-l-4 border-yellow-500"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === "success" && (
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {notification.type === "error" && (
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {notification.type === "warning" && (
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    notification.type === "success"
                      ? "text-green-800"
                      : notification.type === "error"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() =>
                  setNotification({ show: false, message: "", type: "" })
                }
                className="ml-4 flex-shrink-0"
              >
                <svg
                  className="h-4 w-4 text-gray-400 hover:text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-12">
          {/* Exit Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-raimes-purple text-white rounded-lg hover:opacity-90 transition-all"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Exit Questionnaire</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {questionnaire?.title || "Assessment Questionnaire"}
          </h1>

          <p className="text-gray-600 mb-2">
            {questionnaire?.description ||
              "Complete this assessment to evaluate your company's responsible mining practices"}
          </p>

          {questionnaireId && (
            <p className="text-sm text-gray-500 mb-2">
              Questionnaire ID: {questionnaireId}
            </p>
          )}

          <p className="text-gray-600 mb-8">
            Total Questions: {totalQuestions}
          </p>

          {/* Show message if no questions */}
          {questions.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No questions available for this questionnaire.
              </p>
            </div>
          )}

          {/* Show questions by category with pagination */}
          {questions.length > 0 && categories.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-raimes-purple">
                  Category: {categories[categoryIndex]}
                </h2>
                <div className="flex gap-2">
                  <button
                    disabled={categoryIndex === 0}
                    onClick={() => setCategoryIndex((i) => i - 1)}
                    className={`px-4 py-2 rounded-lg font-medium ${categoryIndex === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-raimes-purple text-white hover:opacity-90"}`}
                  >
                    Previous
                  </button>
                  <button
                    disabled={categoryIndex === categories.length - 1}
                    onClick={() => setCategoryIndex((i) => i + 1)}
                    className={`px-4 py-2 rounded-lg font-medium ${categoryIndex === categories.length - 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-raimes-purple text-white hover:opacity-90"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="space-y-12">
                {questions
                  .filter((q) => q.category === categories[categoryIndex])
                  .map((question, index) => {
                    const questionId = question.questionID || question.questionid || question.id;
                    const questionOptions = question.options || {};
                    return (
                      <div key={`question-${questionId}`} className="border-2 border-gray-200 rounded-lg p-6 hover:border-raimes-purple transition-all">
                        {/* Question Header */}
                        <div className="mb-6 pb-4 border-b border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold text-raimes-purple">
                              Question {index + 1}
                            </h3>
                            <span className="px-3 py-1 bg-purple-100 text-raimes-purple text-sm font-medium rounded-full">
                              {question.category}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium text-lg leading-relaxed">
                            {question.text}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                              </svg>
                              Type: {question.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                              </svg>
                              Weight: {question.weight}/10
                            </span>
                            <span className="flex items-center gap-1">
                              {question.require_evidence ? (
                                <><svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg> Evidence Required</>
                              ) : (
                                <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> Evidence Optional</>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Answer Section */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Your Answer
                            </label>
                            {question.type === "essay" && (
                              <>
                                <textarea
                                  value={answers[questionId] || ""}
                                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                                  placeholder="Please provide a detailed answer..."
                                  className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-raimes-purple placeholder-gray-400"
                                />
                                <div className="mt-2 text-sm text-gray-500">
                                  {(answers[questionId] || "").length}/1000 characters
                                </div>
                              </>
                            )}
                            {question.type === "multiple_choice" && (
                              <div className="space-y-3">
                                {["option_a", "option_b", "option_c", "option_d", "option_e"].map((optionKey) => {
                                  const optionValue = questionOptions[optionKey];
                                  if (!optionValue) return null;
                                  return (
                                    <label
                                      key={`${questionId}-${optionKey}`}
                                      className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-raimes-purple cursor-pointer transition-all"
                                    >
                                      <input
                                        type="radio"
                                        name={`question_${questionId}`}
                                        value={optionValue}
                                        checked={String(answers[questionId]) === String(optionValue)}
                                        onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                                        className="mt-1 h-4 w-4 text-raimes-purple focus:ring-raimes-purple"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900 leading-snug font-medium">
                                          {optionValue}
                                        </p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                            <button
                              onClick={() => handleSaveAnswer(questionId)}
                              className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                              </svg>
                              Save Answer
                            </button>
                          </div>
                          {/* File Upload Section */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Supporting Evidence
                              {question.require_evidence && <span className="text-red-500 ml-1">*</span>}
                              {!question.require_evidence && <span className="text-gray-400 ml-1">(Optional)</span>}
                            </label>
                            <div
                              onDrop={(e) => handleDrop(e, questionId)}
                              onDragOver={handleDragOver}
                              className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-raimes-purple hover:bg-purple-50 transition-colors"
                              onClick={() => document.getElementById(`fileInput_${questionId}`).click()}
                            >
                              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-raimes-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">Drop files here or click to upload</p>
                              <p className="text-xs text-gray-400">PDF, DOC, DOCX, or images (max 10MB)</p>
                            </div>
                            <input
                              id={`fileInput_${questionId}`}
                              type="file"
                              multiple
                              onChange={(e) => handleFileChange(e, questionId)}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            {files[questionId]?.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-medium text-gray-600">Uploaded Files:</p>
                                <ul className="space-y-1">
                                  {files[questionId].map((file, idx) => (
                                    <li key={idx} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                                      <span className="text-gray-700 truncate">{file.name}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFiles(prev => ({
                                            ...prev,
                                            [questionId]: prev[questionId].filter((_, i) => i !== idx)
                                          }));
                                        }}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                                        </svg>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-8 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-raimes-purple font-semibold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-raimes-purple h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmitAssessment}
              disabled={submitting}
              className={`px-8 py-4 rounded-lg flex items-center gap-3 transition-colors font-bold text-lg ${
                submitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-raimes-purple hover:opacity-90 text-white shadow-lg"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Assessment...
                </>
              ) : (
                <>
                  Complete Assessment
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Tips for Better Assessment
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Provide detailed, specific answers based on your actual practices
                    </li>
                    <li>Upload relevant documents as evidence when required</li>
                    <li>
                      Save your progress regularly. You can return later to complete the assessment
                    </li>
                    <li>
                      All questions are displayed on this page - scroll through to see them all
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionnairePage;
