import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import QuestionnairePage from './pages/QuestionnairePage';
import AssessmentResults from './pages/AssessmentResults';
import DataValidation from './pages/DataValidation';
import LandingPage from './pages/LandingPage';
import { useAuth } from './context/AuthContext';

const RootIndex = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-raimes-purple"></div>
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootIndex />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
<<<<<<< HEAD
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/questionnaire" element={<ProtectedRoute><QuestionnairePage /></ProtectedRoute>} />
=======
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/questionnaire" 
            element={
              <ProtectedRoute>
                <QuestionnairePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assessment-results"
            element={
              <ProtectedRoute>
                <AssessmentResults />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/data-validation"
            element={
              <ProtectedRoute>
                <DataValidation />
              </ProtectedRoute>
            }
          />
>>>>>>> a5b1ae58c14b396a8ddb66ef237d1d2579c3d16b
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
