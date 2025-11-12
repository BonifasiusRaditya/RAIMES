import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Suspense, lazy } from "react";

// Lazy load pages untuk optimize initial load
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const RegisterRequestPage = lazy(() => import("./pages/RegisterRequestPage"));
const RegistrationPendingPage = lazy(() => import("./pages/RegistrationPendingPage"));
const AdminAccountRequestsPage = lazy(() => import("./pages/AdminAccountRequestsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const RoleDashboard = lazy(() => import("./components/RoleDashboard"));
const QuestionnairePage = lazy(() => import("./pages/QuestionnairePage"));
const AssessmentResults = lazy(() => import("./pages/AssessmentResults"));
const DataValidation = lazy(() => import("./pages/DataValidation"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const EditQuestionnaire = lazy(() => import("./pages/EditQuestionnaire"));
const QuestionnairesPage = lazy(() => import("./pages/QuestionnairesPage"));
import { useAuth } from "./context/AuthContext";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-raimes-purple"></div>
  </div>
);

const RootIndex = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <LandingPage />
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="w-full bg-cover bg-center bg-fixed bg-no-repeat min-h-screen" style={{backgroundColor: '#F6F6FF'}}>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<RootIndex />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-request" element={<RegisterRequestPage />} />
              <Route path="/registration-pending" element={<RegistrationPendingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questionnaires"
                element={
                  <ProtectedRoute>
                    <QuestionnairesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-questionnaire/:id"
                element={
                  <ProtectedRoute>
                    <EditQuestionnaire />
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
              <Route
                path="/admin/account-requests"
                element={
                  <ProtectedRoute>
                    <AdminAccountRequestsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
