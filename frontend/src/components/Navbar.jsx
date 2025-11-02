import { Link } from 'react-router-dom';
import logoFull from '../assets/logo-full.png';

export default function Navbar() {
  return (
    <nav className="bg-raimes-purple px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={logoFull}
            alt="Responsible AI Mining Evaluation System"
            className="h-12"
          />
        </div>

        <div className="flex items-center gap-12">
          <Link
            to="/dashboard"
            className="text-white font-semibold hover:text-raimes-yellow transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/assessment-results"
            className="text-white font-semibold hover:text-raimes-yellow transition-colors"
          >
            Assessment Results
          </Link>
          <Link
            to="/data-validation"
            className="text-white font-semibold hover:text-raimes-yellow transition-colors"
          >
            Data Validation
          </Link>
          <Link
            to="/final-report"
            className="text-white font-semibold hover:text-raimes-yellow transition-colors"
          >
            Final Report
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-1 h-12 bg-raimes-yellow"></div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
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
            </div>
            <div className="flex flex-col">
              <span className="text-raimes-yellow font-semibold">
                Hello, Joko
              </span>
              <span className="text-white text-sm">
                Reviewer
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
