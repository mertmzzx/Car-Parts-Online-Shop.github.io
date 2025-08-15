import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, roles: myRoles } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles?.length) {
    const ok = roles.some((r) => myRoles.includes(r));
    if (!ok) return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
