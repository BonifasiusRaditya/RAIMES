import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { questionService } from "../../services/questionService";
import { assessmentService } from "../../services/assessmentService";
import { useAuth } from "../../context/AuthContext";

function QuestionnairePage() {
  const { id: questionnaireId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questionnaire, setQuestionnaire] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const currentQuestionId = currentQuestion?.questionID || currentQuestion?.questionid || currentQuestion?.id;

  // Force re-render when question changes
  const [renderKey, setRenderKey] = useState(0);
  
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (questionnaireId) {
      // Reset all state when questionnaire changes
      setAnswers({});
      setFiles({});
      setCurrentQuestionIndex(0);
      setSubmitting(false);
      setError('');
      startAssessmentAndLoadQuestions();
    }
  }, [questionnaireId]);

  const startAssessmentAndLoadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('🔍 User data:', user);
      console.log('📋 Starting assessment for questionnaire:', questionnaireId);
      
      // First, check if assessment already exists
      const currentAssessment = await assessmentService.getCurrentAssessment(questionnaireId);
      
      let assessmentData;
      let shouldResume = false;
      
      if (currentAssessment && currentAssessment.success) {
        // Assessment exists, use it
        assessmentData = currentAssessment.data;
        shouldResume = true;
        console.log('📊 Found existing assessment:', assessmentData);
      } else {
        // No assessment exists, create new one
        const assessmentResponse = await assessmentService.startAssessment(questionnaireId);
        console.log('📊 Assessment response:', assessmentResponse);
        
        if (!assessmentResponse.success) {
          setError(`Failed to start assessment: ${assessmentResponse.message || 'Unknown error'}`);
          return;
        }
        assessmentData = assessmentResponse.data;
      }

      // Set assessment data
      const assessmentIdValue = assessmentData.assessmentId || assessmentData.id;
      setAssessmentId(assessmentIdValue);
      setProgressPercentage(assessmentData.progressPercentage || 0);
      console.log('🎯 Assessment data:', {
        assessmentId: assessmentIdValue,
        progress: assessmentData.progressPercentage || 0,
        answered: assessmentData.answeredQuestions?.length || 0,
        total: assessmentData.totalQuestions || 24,
        shouldResume,
        nextIndex: assessmentData.nextQuestionIndex
      });
      
      // Then load questions
      const response = await questionService.getQuestionsByQuestionnaireId(questionnaireId);
      
      if (response.success && response.data) {
        setQuestions(response.data);
        setQuestionnaire({
          id: questionnaireId,
          title: `Mining Assessment Questionnaire ${questionnaireId}`,
          description: "Complete assessment for responsible mining practices"
        });
        
        // Initialize empty answers and files for all questions
        const initialAnswers = {};
        const initialFiles = {};
        response.data.forEach(q => {
          // Get the correct question ID field
          const qId = q.questionID || q.questionid || q.id;
          if (qId) {
            // Initialize with empty strings to avoid undefined
            initialAnswers[qId] = '';
            initialFiles[qId] = [];
          }
        });
        setAnswers(initialAnswers);
        setFiles(initialFiles);

        // If resuming, navigate to the next unanswered question
        if (shouldResume && assessmentData.nextQuestionIndex !== undefined) {
          const resumeIndex = Math.min(assessmentData.nextQuestionIndex, response.data.length - 1);
          setCurrentQuestionIndex(resumeIndex);
          console.log(`🔄 Resuming assessment at question index ${resumeIndex} (question ${resumeIndex + 1})`);
        } else {
          setCurrentQuestionIndex(0);
          console.log('🆕 Starting new assessment at question 1');
        }
        
        console.log('✅ Assessment loaded:', {
          assessmentId: assessmentIdValue,
          questions: response.data.length,
          resuming: shouldResume,
          currentIndex: shouldResume ? assessmentData.nextQuestionIndex : 0,
          progress: assessmentData.progressPercentage || 0
        });
      } else {
        setError('No questions found for this questionnaire.');
      }

    } catch (err) {
      console.error('❌ Error starting assessment:', err);
      if (err.response?.status === 401) {
        setError('Authentication required. Please login again.');
      } else if (err.response?.status === 404) {
        setError('Questionnaire not found.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Failed to start assessment: ${err.response?.data?.message || err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answer
      };
      console.log(`📝 Answer updated for question ${questionId}:`, answer);
      console.log('📋 All answers now:', newAnswers);
      return newAnswers;
    });
  };

  const handleFileChange = (e, questionId) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), ...selectedFiles]
    }));
  };

  const handleDrop = (e, questionId) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), ...droppedFiles]
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSaveAndContinue = async () => {
    if (currentQuestion && assessmentId) {
      try {
        const hasAnswer = answers[currentQuestionId]?.trim();
        const hasFiles = files[currentQuestionId]?.length > 0;
        
        if (!hasAnswer && !hasFiles) {
          alert('Please provide an answer or upload supporting evidence before continuing.');
          return;
        }

        setSubmitting(true);
        
        // Save progress to backend
        const progressResponse = await assessmentService.saveProgress({
          assessmentId: questionnaireId, // Pass questionnaireId instead of assessmentId
          questionId: currentQuestionId,
          answer: answers[currentQuestionId],
          files: files[currentQuestionId]
        });

        if (progressResponse.success) {
          const newProgress = progressResponse.data.progressPercentage || 0;
          setProgressPercentage(newProgress);
          alert(`Answer saved! Progress: ${newProgress}%`);
          
          console.log('📊 Progress updated:', {
            progressPercentage: newProgress,
            answeredQuestions: progressResponse.data.answeredQuestions?.length || 0,
            totalQuestions: progressResponse.data.totalQuestions || 10
          });

          // Auto move to next question
          handleNextQuestion();
        } else {
          alert('Failed to save progress. Please try again.');
        }
      } catch (error) {
        console.error('Error saving progress:', error);
        alert('Failed to save progress. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const oldQuestionId = currentQuestionId;
      const newIndex = currentQuestionIndex + 1;
      const newQuestionId = questions[newIndex]?.questionID || questions[newIndex]?.questionid || questions[newIndex]?.id;
      
      console.log(`🔄 Moving from question ${oldQuestionId} to ${newQuestionId}`);
      console.log(`📋 Current answer for ${oldQuestionId}:`, answers[oldQuestionId]);
      
      setCurrentQuestionIndex(newIndex);
      
      // Update current position on server
      if (questionnaireId) {
        await assessmentService.updateCurrentPosition(questionnaireId, newIndex);
      }
      // Don't reset answers - keep user's previous answers
      // setAnswers(prev => ({ ...prev })); // Keep existing answers
    }
  };

  const handlePreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      const oldQuestionId = currentQuestionId;
      const newIndex = currentQuestionIndex - 1;
      const newQuestionId = questions[newIndex]?.questionID || questions[newIndex]?.questionid || questions[newIndex]?.id;
      
      console.log(`🔄 Moving back from question ${oldQuestionId} to ${newQuestionId}`);
      console.log(`📋 Current answer for ${newQuestionId}:`, answers[newQuestionId]);
      
      setCurrentQuestionIndex(newIndex);
      
      // Update current position on server
      if (questionnaireId) {
        await assessmentService.updateCurrentPosition(questionnaireId, newIndex);
      }
      // Don't reset answers - keep user's previous answers
      // setAnswers(prev => ({ ...prev })); // Keep existing answers
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      setSubmitting(true);
      
      const submissionData = {
        questionnaireId,
        answers,
        submittedAt: new Date().toISOString()
      };

      const response = await questionService.submitAnswers(submissionData);
      
      if (response.success) {
        alert('Assessment submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
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
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Questionnaire</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startAssessmentAndLoadQuestions}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/dashboard')}
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

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {questionnaire?.title || 'Assessment Questionnaire'}
          </h1>
          
          <p className="text-gray-600 mb-2">
            {questionnaire?.description || 'Complete this assessment to evaluate your company\'s responsible mining practices'}
          </p>
          
          {questionnaireId && (
            <p className="text-sm text-gray-500 mb-2">
              Questionnaire ID: {questionnaireId}
            </p>
          )}

          <p className="text-gray-600 mb-8">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>

          {/* Show message if no questions */}
          {questions.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No questions available for this questionnaire.</p>
            </div>
          )}

          {/* Show current question */}
          {currentQuestion && (
            <div key={`question-container-${currentQuestionId}-${renderKey}`}>
              <div className="mb-6">
                <p className="text-gray-900 mb-6 font-medium text-lg">
                  {currentQuestion.text}
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  <span className="font-medium">Category:</span> {currentQuestion.category}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Type:</span> {currentQuestion.type}
                  <span className="mx-2">•</span>
                  <span className="font-medium">Weight:</span> {currentQuestion.weight}/10
                  <span className="mx-2">•</span>
                  <span className="font-medium">Evidence Required:</span> {currentQuestion.require_evidence ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" key={`question-grid-${currentQuestionId}`}>
                {/* Answer Input */}
                <div key={`answer-section-${currentQuestionId}`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer (Question ID: {currentQuestionId})
                  </label>
                  
                  {/* Essay Question */}
                  {currentQuestion.type === 'essay' && (
                    <>
                      <div className="mb-2 text-xs text-gray-400 font-mono">
                        Debug: Question ID: {currentQuestionId} | Answer: "{answers[currentQuestionId] || 'undefined'}"
                      </div>
                      <textarea
                        key={`essay-${currentQuestionId}`}
                        value={answers[currentQuestionId] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestionId, e.target.value)}
                        placeholder="Please provide a detailed answer to the question above..."
                        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        {(answers[currentQuestionId] || '').length}/1000 characters
                      </div>
                    </>
                  )}
                  
                  {/* Default textarea for any question type if no specific options */}
                  {currentQuestion.type !== 'multiple_choice' && currentQuestion.type !== 'essay' && (
                    <>
                      <div className="mb-2 text-xs text-gray-400 font-mono">
                        Debug: Question ID: {currentQuestionId} | Answer: "{answers[currentQuestionId] || 'undefined'}"
                      </div>
                      <textarea
                        key={`default-${currentQuestionId}`}
                        value={answers[currentQuestionId] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestionId, e.target.value)}
                        placeholder="Please provide a detailed answer to the question above..."
                        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        {(answers[currentQuestionId] || '').length}/1000 characters
                      </div>
                    </>
                  )}
                  
                  {/* Multiple Choice Question */}
                  {currentQuestion.type === 'multiple_choice' && currentQuestion.options && currentQuestion.options.length > 0 ? (
                    <>
                      <div className="mb-2 text-xs text-gray-400 font-mono">
                        Debug: Question ID: {currentQuestionId} | Selected: "{answers[currentQuestionId] || 'none'}"
                      </div>
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label key={`${currentQuestionId}-option-${index}`} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`question_${currentQuestionId}`}
                              value={option}
                              checked={answers[currentQuestionId] === option}
                              onChange={(e) => handleAnswerChange(currentQuestionId, e.target.value)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="text-gray-700 flex-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  ) : currentQuestion.type === 'multiple_choice' ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm mb-3">No options available. Please provide your answer below:</p>
                        <div className="mb-2 text-xs text-gray-400 font-mono">
                          Debug: Question ID: {currentQuestionId} | Answer: "{answers[currentQuestionId] || 'undefined'}"
                        </div>
                        <textarea
                          key={`mc-fallback-${currentQuestionId}`}
                          value={answers[currentQuestionId] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestionId, e.target.value)}
                          placeholder="Please provide your answer..."
                          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* File Upload - always show, but mark as required only if needed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Evidence {currentQuestion.require_evidence && <span className="text-red-500">*</span>}
                    {!currentQuestion.require_evidence && <span className="text-gray-400">(Optional)</span>}
                  </label>
                  <div
                    onDrop={(e) => handleDrop(e, currentQuestionId)}
                    onDragOver={handleDragOver}
                    className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    onClick={() => document.getElementById(`fileInput_${currentQuestionId}`).click()}
                  >
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="w-8 h-8 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-medium mb-1">
                        Upload Supporting Documents
                      </p>
                      <p className="text-gray-500 text-sm text-center px-4">
                        Drag & drop files here or click to browse<br />
                        Supported: PDF, DOC, JPG, PNG (Max 10MB each)
                      </p>
                    </div>
                  <input
                    id={`fileInput_${currentQuestionId}`}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, currentQuestionId)}
                    className="hidden"
                  />
                  
                  {files[currentQuestionId] && files[currentQuestionId].length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Attached Files ({files[currentQuestionId].length}):
                      </p>
                      <ul className="space-y-1">
                        {files[currentQuestionId].map((file, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center justify-between">
                            <span className="truncate">{file.name}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newFiles = files[currentQuestionId].filter((_, i) => i !== index);
                                setFiles(prev => ({
                                  ...prev,
                                  [currentQuestionId]: newFiles
                                }));
                              }}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">
                    {progressPercentage}% ({Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% by navigation)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.max(progressPercentage, ((currentQuestionIndex + 1) / totalQuestions) * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Real progress: {progressPercentage}% | Navigation progress: {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAndContinue}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
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
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save & Continue
                  </button>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      Next Question
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitAssessment}
                      disabled={submitting}
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold ${
                        submitting
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Complete Assessment
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Tips for Better Assessment</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Provide detailed, specific answers based on your actual practices</li>
                    <li>Upload relevant documents as evidence when required</li>
                    <li>You can save your progress and return later to complete the assessment</li>
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
