import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="ops-page">
        <p className="page-kicker">Loading session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    if (user.role === 'CUSTOMER') {
      return <Navigate to="/garage" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
