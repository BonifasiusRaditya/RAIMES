import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const RegisterRequestPage = () => {
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
  const [fieldErrors, setFieldErrors] = useState({ username: '', email: '', companyname: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        // Redirect to success/pending page
        navigate('/registration-pending', { 
          state: { 
            email: formData.email,
            role: formData.role,
            username: formData.username
          } 
        });
      }
    } catch (err) {
      console.error('Registration request error:', err);
      // Handle string message returned from axios interceptor
      const isString = typeof err === 'string';
      const status = isString ? undefined : err.response?.status;
      const data = isString ? {} : (err.response?.data || {});
      const baseMsg = isString ? err : (data.message || '');
      const msg = String(baseMsg).toLowerCase();

      const newFieldErrors = { username: '', email: '', companyname: '' };

      if (Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          const field = (e.field || '').toLowerCase();
          const message = e.message || 'Invalid value';
          if (field === 'email') newFieldErrors.email = message;
          if (field === 'username') newFieldErrors.username = message;
          if (field === 'companyname' || field === 'company_name') newFieldErrors.companyname = message;
        });
      }

      if (status === 409 || /duplicate|already exists|unique constraint|registered|taken/.test(msg)) {
        if (/email/.test(msg)) newFieldErrors.email = newFieldErrors.email || 'Email already registered';
        if (/username|user name/.test(msg)) newFieldErrors.username = newFieldErrors.username || 'Username already taken';
        if (/company/.test(msg)) newFieldErrors.companyname = newFieldErrors.companyname || 'Company name already exists';
      }

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
    <div className="relative min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-raimes-purple/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-raimes-purple/10 blur-3xl"></div>

      <div className="relative max-w-md w-full space-y-8 bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-raimes-purple/15 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-raimes-purple/10 mb-3 ring-1 ring-raimes-purple/20">
            <svg className="h-6 w-6 text-raimes-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-raimes-purple">
            Request Account Registration
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Your request will be reviewed by admin
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account Details</h3>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm bg-white/70 ${fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-raimes-purple focus:border-raimes-purple'}`}
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm bg-white/70 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-raimes-purple focus:border-raimes-purple'}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Register as <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-raimes-purple sm:text-sm bg-white/70"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Company / User</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            {formData.role === 'user' && (
              <>
                <h3 className="pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Company Details</h3>
                <div>
                  <label htmlFor="companyname" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyname"
                    name="companyname"
                    type="text"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm bg-white/70 ${fieldErrors.companyname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-raimes-purple focus:border-raimes-purple'}`}
                    placeholder="Enter company name"
                    value={formData.companyname}
                    onChange={handleChange}
                  />
                  {fieldErrors.companyname && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.companyname}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-raimes-purple sm:text-sm bg-white/70"
                    placeholder="Enter company address (optional)"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-raimes-purple sm:text-sm bg-white/70"
                placeholder="Enter password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-raimes-purple sm:text-sm bg-white/70"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-raimes-purple hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-raimes-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Registration Request'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-raimes-purple hover:opacity-80">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterRequestPage;
