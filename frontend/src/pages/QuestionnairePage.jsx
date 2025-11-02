import { useState } from 'react';
import Navbar from '../components/Navbar';

function QuestionnairePage() {
  const [answer, setAnswer] = useState('');
  const [files, setFiles] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 10;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSaveAndContinue = () => {
    console.log('Saving answer:', answer);
    console.log('Attached files:', files);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer('');
      setFiles([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Questionnaire for Company Assessment
          </h1>

          <p className="text-gray-600 mb-8">
            Question {currentQuestion} of {totalQuestions}
          </p>

          <div className="mb-6">
            <p className="text-gray-900 mb-2">
              How is nickel smelting process conducted in the year 2025?
            </p>
            <p className="text-gray-900 mb-6">
              And what is the percentage of pure nickel produced?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your essay answer here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
              />
            </div>

            <div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => document.getElementById('fileInput').click()}
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-500"
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
                <p className="text-gray-900 font-medium mb-1">Upload Supporting File</p>
                <p className="text-gray-500 text-sm">Drag & drop or click to browse</p>
              </div>
              <input
                id="fileInput"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              {files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Attached files:</p>
                  <ul className="text-sm text-gray-700">
                    {files.map((file, index) => (
                      <li key={index} className="truncate">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
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

            <button
              onClick={handleNextQuestion}
              className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-300 flex items-center gap-2 transition-colors"
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionnairePage;
