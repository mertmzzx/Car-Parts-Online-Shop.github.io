// src/app/ProtectedRoute.js
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, hasAnyRole } = useAuth();
  const loc = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }
  if (roles && !hasAnyRole(roles)) {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}
