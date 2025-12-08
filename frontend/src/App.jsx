import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AuditorRoute from "./components/AuditorRoute";
import { Suspense, lazy } from "react";

// Lazy load pages untuk optimize initial load
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const RegisterRequestPage = lazy(() =>
  import("./pages/auth/RegisterRequestPage")
);
const RegistrationPendingPage = lazy(() =>
  import("./pages/auth/RegistrationPendingPage")
);
const AdminAccountRequestsPage = lazy(() =>
  import("./pages/admin/AdminAccountRequestsPage")
);
const ContactPage = lazy(() => import("./pages/user/ContactPage"));
const RoleDashboard = lazy(() => import("./components/RoleDashboard"));
const QuestionnairePage = lazy(() => import("./pages/user/QuestionnairePage"));
const AssessmentResults = lazy(() =>
  import("./pages/auditor/AssessmentResults")
);
const AIAnalysisDetailPage = lazy(() =>
  import("./pages/auditor/AIAnalysisDetailPage")
);
const DataValidation = lazy(() => import("./pages/auditor/DataValidation"));
const LandingPage = lazy(() => import("./pages/shared/LandingPage"));
const EditQuestionnaire = lazy(() =>
  import("./pages/auditor/EditQuestionnaire")
);
const QuestionnairesPage = lazy(() =>
  import("./pages/auditor/QuestionnairesPage")
);
const AddAccountPage = lazy(() => import("./pages/admin/AddAccountPage"));
const MyAssessmentsPage = lazy(() => import("./pages/user/MyAssessmentsPage"));
const ResultsPage = lazy(() => import("./pages/user/ResultsPage"));
const ResourcesPage = lazy(() => import("./pages/user/ResourcesPage"));
const AssessmentDetailPage = lazy(() =>
  import("./pages/user/AssessmentDetailPage")
);
const AssessmentResultsPage = lazy(() =>
  import("./pages/user/AssessmentResultsPage")
);
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
      <div
        className="w-full bg-cover bg-center bg-fixed bg-no-repeat min-h-screen"
        style={{ backgroundColor: "#F6F6FF" }}
      >
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<RootIndex />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/register-request"
                element={<RegisterRequestPage />}
              />
              <Route
                path="/registration-pending"
                element={<RegistrationPendingPage />}
              />
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
                  <AuditorRoute>
                    <QuestionnairesPage />
                  </AuditorRoute>
                }
              />
              <Route
                path="/edit-questionnaire/:id"
                element={
                  <AuditorRoute>
                    <EditQuestionnaire />
                  </AuditorRoute>
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
                path="/questionnaire/:id"
                element={
                  <ProtectedRoute>
                    <QuestionnairePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-assessments"
                element={
                  <ProtectedRoute>
                    <MyAssessmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment-result/:assessmentId"
                element={
                  <ProtectedRoute>
                    <AssessmentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment-results/:assessmentId"
                element={
                  <ProtectedRoute>
                    <AssessmentResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <ResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment-results"
                element={
                  <AuditorRoute>
                    <AssessmentResults />
                  </AuditorRoute>
                }
              />
              <Route
                path="/ai-analysis/:assessmentId"
                element={
                  <AuditorRoute>
                    <AIAnalysisDetailPage />
                  </AuditorRoute>
                }
              />
              <Route
                path="/data-validation"
                element={
                  <AuditorRoute>
                    <DataValidation />
                  </AuditorRoute>
                }
              />
              <Route
                path="/admin/account-requests"
                element={
                  <AdminRoute>
                    <AdminAccountRequestsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/add-account"
                element={
                  <AdminRoute>
                    <AddAccountPage />
                  </AdminRoute>
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
