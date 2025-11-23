import Navbar from "../../components/Navbar";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-raimes-purple"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Under Development
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The Resources page is currently being developed. Check back soon for
            updates!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go Back
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-6 py-3 bg-raimes-purple text-white rounded-lg hover:opacity-90 transition-all font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
