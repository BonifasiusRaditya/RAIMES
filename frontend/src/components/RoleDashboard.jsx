import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import CompanyDashboard from '../pages/CompanyDashboard';

const RoleDashboard = () => {
  const { user } = useAuth();

  // Redirect based on user role
  // Admin and auditor use the admin dashboard
  // Regular users (companies) use the company dashboard
  if (user?.role === 'admin' || user?.role === 'auditor') {
    return <Dashboard />;
  }

  // Default to company dashboard for 'user' role
  return <CompanyDashboard />;
};

export default RoleDashboard;
