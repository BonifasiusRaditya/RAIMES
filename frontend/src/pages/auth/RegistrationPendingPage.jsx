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
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-raimes-purple/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-raimes-purple/10 blur-3xl"></div>

      <div className="relative max-w-md w-full space-y-8 bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-raimes-purple/15 shadow-lg">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-raimes-purple/10 mb-4 ring-1 ring-raimes-purple/20">
            <svg className="h-10 w-10 text-raimes-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-raimes-purple mb-2">
            Registration Submitted
          </h2>
          <p className="text-base text-gray-700 mb-6">
            Thank you for submitting your registration request.
          </p>
        </div>

        <div className="bg-raimes-purple/5 border border-raimes-purple/20 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-raimes-purple" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-raimes-purple">
                What happens next?
              </h3>
              <div className="mt-2 text-sm text-gray-700">
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

        <div className="bg-white/60 border border-gray-200 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">Registration Details</h3>
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
            <p><span className="font-medium">Status:</span> <span className="text-gray-800 font-semibold">Pending Review</span></p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="w-full flex justify-center py-2 px-4 rounded-lg text-sm font-semibold text-white bg-raimes-purple hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-raimes-purple transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? <Link to="/contact" className="text-raimes-purple hover:opacity-80">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPendingPage;
