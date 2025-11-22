import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const RegistrationPendingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, role, username } = location.state || {};

  useEffect(() => {
    // Redirect to home if no state data
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Registration Submitted!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for submitting your registration request.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                What happens next?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Admin will review your registration request</li>
                  <li>You'll receive a notification once reviewed</li>
                  <li>If approved, you can login with your credentials</li>
                  <li>If rejected, you'll be notified with the reason</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Registration Details:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {username && (
              <p><span className="font-medium">Username:</span> {username}</p>
            )}
            {email && (
              <p><span className="font-medium">Email:</span> {email}</p>
            )}
            {role && (
              <p><span className="font-medium">Role:</span> {role === 'user' ? 'Company / User' : 'Auditor'}</p>
            )}
            <p><span className="font-medium">Status:</span> <span className="text-yellow-600 font-semibold">Pending Review</span></p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/check-status"
            className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Check Registration Status
          </Link>
          
          <Link
            to="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? <Link to="/contact" className="text-blue-600 hover:text-blue-500">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPendingPage;
