import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { assessmentService } from "../../services/assessmentService";

export default function DataValidation() {
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get("assessmentId");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessmentData, setAssessmentData] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [questionNotes, setQuestionNotes] = useState({}); // { questionId: noteText }
  const [saving, setSaving] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentDetail();
    } else {
      setError("No assessment ID provided");
      setLoading(false);
    }
  }, [assessmentId]);

  const fetchAssessmentDetail = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🚀 Starting fetchAssessmentDetail for ID:", assessmentId);
      const response = await assessmentService.getAssessmentDetail(assessmentId);
      console.log("📋 Raw Assessment detail response:", JSON.stringify(response, null, 2));
      console.log("📋 Response type:", typeof response);
      console.log("📋 Response.success:", response?.success);
      console.log("📋 Response.data:", response?.data);
      
      if (response && response.success) {
        console.log("✅ Setting assessment data");
        setAssessmentData(response.data);
        setReviewerNotes(response.data.reviewerNotes || "");
        
        // Parse question notes if they exist
        if (response.data.questionReviewerNotes) {
          try {
            const parsedNotes = typeof response.data.questionReviewerNotes === 'string' 
              ? JSON.parse(response.data.questionReviewerNotes)
              : response.data.questionReviewerNotes;
            setQuestionNotes(parsedNotes || {});
          } catch (e) {
            console.error("Error parsing question notes:", e);
            setQuestionNotes({});
          }
        }
      } else {
        console.log("❌ Response failed validation:", { hasResponse: !!response, success: response?.success });
        setError("Failed to load assessment details");
      }
    } catch (err) {
      console.error("❌ Exception in fetchAssessmentDetail:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      setError("Failed to load assessment details");
    } finally {
      console.log("🏁 fetchAssessmentDetail finished, loading:", false);
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSaving(true);
      await assessmentService.saveReviewerNotes(assessmentId, reviewerNotes, questionNotes);
      alert("Reviewer notes saved successfully!");
    } catch (err) {
      console.error("Error saving notes:", err);
      alert("Failed to save reviewer notes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-4 text-gray-600">Loading assessment details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error || "Assessment not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-4xl font-bold text-raimes-purple mb-6">
          {assessmentData.companyName} Data Validation
        </h1>

        {/* AI Analysis Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-raimes-purple mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Analysis
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-raimes-purple to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                {assessmentData.finalScore || "N/A"}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">AI Score</div>
                <div className="text-lg font-semibold text-raimes-purple">
                  {assessmentData.finalScore !== null ? `${assessmentData.finalScore}/100` : "Pending"}
                </div>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {assessmentData.aiAnalysis || "No AI analysis available yet. Complete the assessment to generate analysis."}
              </p>
            </div>
          </div>
        </div>

        {/* Questionnaire Answers Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-raimes-purple mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Questionnaire Answers
          </h2>
          
          {(() => {
            const sections = Object.entries(assessmentData.questionsByCategory || {});
            if (sections.length === 0) return <p className="text-gray-500">No questions available.</p>;
            
            const [currentCategory, currentQuestions] = sections[currentSectionIndex];
            const totalSections = sections.length;
            
            return (
              <>
                {/* Section Title and Navigation */}
                <div className="mb-6 pb-4 border-b-2 border-raimes-purple">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-raimes-purple">
                        {currentCategory}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Section {currentSectionIndex + 1} of {totalSections}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentSectionIndex === 0}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentSectionIndex(prev => Math.min(totalSections - 1, prev + 1))}
                        disabled={currentSectionIndex === totalSections - 1}
                        className="px-4 py-2 bg-raimes-purple text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Questions for Current Section */}
                <div className="space-y-4">
                  {currentQuestions.map((q, idx) => (
                    <div key={q.questionId} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      {/* Top Row: Question Number + Text and Max Points */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 bg-raimes-purple text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </div>
                          <p className="font-medium text-gray-900 flex-1">
                            {q.questionText}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 bg-purple-100 px-3 py-1 rounded-full">
                          <span className="text-xs font-semibold text-raimes-purple">
                            Max Points: {q.weight || 0}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Answer (left) and Reviewer Note (right) side by side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column: User's Answer */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            User's Answer
                          </label>
                          {q.answered ? (
                            <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[100px]">
                              <p className="text-sm text-gray-700">{q.answer}</p>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[100px]">
                              <p className="text-sm text-gray-500 italic">No answer provided</p>
                            </div>
                          )}
                        </div>

                        {/* Right Column: Reviewer Note */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reviewer Note
                          </label>
                          <textarea
                            value={questionNotes[q.questionId] || ""}
                            onChange={(e) => setQuestionNotes(prev => ({
                              ...prev,
                              [q.questionId]: e.target.value
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-raimes-purple focus:border-transparent resize-none min-h-[100px]"
                            placeholder="Add your review notes for this specific question..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Navigation */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentSectionIndex === 0}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous Section
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentSectionIndex + 1} / {totalSections}
                  </span>
                  <button
                    onClick={() => setCurrentSectionIndex(prev => Math.min(totalSections - 1, prev + 1))}
                    disabled={currentSectionIndex === totalSections - 1}
                    className="px-5 py-2.5 bg-raimes-purple text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
                  >
                    Next Section
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            );
          })()}
        </div>

        {/* Overall Reviewer Notes Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-raimes-purple mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Overall Review Notes
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Add your overall assessment notes here. Individual question notes are provided above each question.
          </p>
          <textarea
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[150px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-raimes-purple"
            placeholder="Enter your overall review notes, final observations, and recommendations here..."
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="px-6 py-3 bg-raimes-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save All Notes
                </>
              )}
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
