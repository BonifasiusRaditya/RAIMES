import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logoFull from '../assets/logo-full.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.nav
      className="bg-raimes-purple px-8 py-4"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <motion.img
            src={logoFull}
            alt="Responsible AI Mining Evaluation System"
            className="h-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
        </div>

        <div className="flex items-center gap-12">
          {[['/dashboard','Dashboard'],['/assessment-results','Assessment Results'],['/data-validation','Data Validation'],['/final-report','Final Report']].map(([to, label]) => (
            <motion.div key={to} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={to}
                className="text-white font-semibold hover:text-raimes-yellow transition-colors"
              >
                {label}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-1 h-12 bg-raimes-yellow"></div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <motion.div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden" whileHover={{ scale: 1.03 }}>
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
              <div className="flex flex-col items-start">
                <span className="text-raimes-yellow font-semibold">
                  Hello, {user?.username || 'User'}
                </span>
                <span className="text-white text-sm capitalize">
                  {user?.role || 'User'}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <motion.div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-raimes-purple">{user?.username}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
