// src/auth/RequireRole.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireRole({ allowed, children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not signed in => go to /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const ok = roles.some(r => allowed.includes(r));

  // Signed in but lacks role => send them away (you can make a /403 page if you want)
  if (!ok) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
