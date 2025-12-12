import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

function AddAccountPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    companyname: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: '', email: '', companyname: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error when user edits the field
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({ username: '', email: '', companyname: '' });

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'user' && !formData.companyname.trim()) {
      setError('Company name is required for user registration');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'user' && {
          companyname: formData.companyname.trim(),
          address: formData.address.trim()
        })
      };

      const response = await api.post('/auth/register-request', payload);

      if (response.data.success) {
        setSuccess('Account created successfully!');
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          companyname: '',
          address: ''
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/admin/account-requests');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration request error:', err);
      // The axios interceptor returns a string message; handle both string and object
      const isString = typeof err === 'string';
      const status = isString ? undefined : err.response?.status;
      const data = isString ? {} : (err.response?.data || {});
      const baseMsg = isString ? err : (data.message || '');
      const msg = String(baseMsg).toLowerCase();

      // Map common duplicate/constraint errors to specific fields
      const newFieldErrors = { username: '', email: '', companyname: '' };

      // If backend returns structured errors
      if (Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          const field = (e.field || '').toLowerCase();
          const message = e.message || 'Invalid value';
          if (field === 'email') newFieldErrors.email = message;
          if (field === 'username') newFieldErrors.username = message;
          if (field === 'companyname' || field === 'company_name') newFieldErrors.companyname = message;
        });
      }

      // Heuristics based on status/message
      if (status === 409 || /duplicate|already exists|unique constraint/.test(msg)) {
        if (/email/.test(msg)) newFieldErrors.email = newFieldErrors.email || 'Email already exists';
        if (/username|user name/.test(msg)) newFieldErrors.username = newFieldErrors.username || 'Username already exists';
        if (/company/.test(msg)) newFieldErrors.companyname = newFieldErrors.companyname || 'Company name already exists';
      }

      // Apply field errors if any, else show generic error
      if (newFieldErrors.email || newFieldErrors.username || newFieldErrors.companyname) {
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted fields.');
      } else {
        setError(baseMsg || 'Registration request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/admin/account-requests')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-raimes-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold text-raimes-purple">
              Add New Account
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Create a new user account for the RAIMES system
          </p>
        </div>
        
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alert Messages */}
            {error && (
              <div className="rounded-lg bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800">Success</p>
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-raimes-purple mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-raimes-purple focus:border-transparent'}`}
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {fieldErrors.username && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-raimes-purple focus:border-transparent'}`}
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent transition-all appearance-none bg-white"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="user">Company / User</option>
                      <option value="auditor">Auditor</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select the appropriate role for this account</p>
                </div>
              </div>
            </div>

            {/* Company Information (conditional) */}
            {formData.role === 'user' && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-raimes-purple mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Information
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="companyname" className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="companyname"
                      name="companyname"
                      type="text"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.companyname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-raimes-purple focus:border-transparent'}`}
                      placeholder="Enter company name"
                      value={formData.companyname}
                      onChange={handleChange}
                    />
                    {fieldErrors.companyname && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.companyname}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent transition-all resize-none"
                      placeholder="Enter company address (optional)"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Information */}
            <div>
              <h3 className="text-lg font-semibold text-raimes-purple mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent transition-all"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent transition-all"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/account-requests')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-raimes-purple text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddAccountPage;
