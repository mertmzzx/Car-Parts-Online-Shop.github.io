// src/context/AuthContext.js
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api from "../services/http";
import { login as apiLogin, register as apiRegister } from "../services/authService";

const STORAGE_KEY = "cps_auth_client_v1";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// Normalize your API response -> { token, user: { email, roles: [role] } }
function normalizeAuth(payload) {
  if (!payload) return null;
  const token = payload.Token ?? payload.token;
  const role = payload.Role ?? payload.role;
  const userName = payload.UserName ?? payload.userName;
  const firstName = payload.FirstName ?? payload.firstName;
  const lastName = payload.LastName ?? payload.lastName;

  if (!token || !userName) return null;

  return {
    token,
    user: {
      email: userName,
      roles: role ? [role] : [],
      firstName: firstName,
      lastName: lastName,
    },
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.token ? parsed : null;
    } catch {
      return null;
    }
  });

  // Attach/remove Authorization header
  useEffect(() => {
    if (auth?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [auth?.token]);

  // Persist
  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  // ---- Stable callbacks ----
  const login = useCallback(async ({ email, password }) => {
    const res = await apiLogin({ email, password });
    const normalized = normalizeAuth(res);
    if (!normalized) throw new Error("Invalid auth response.");
    setAuth(normalized);
    return normalized;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await apiRegister(payload);
    const normalized = normalizeAuth(res);
    if (!normalized) throw new Error("Invalid auth response.");
    setAuth(normalized);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
  }, []);

  const isInRole = useCallback(
    (role) => !!auth?.user?.roles?.includes(role),
    [auth]
  );

  const hasAnyRole = useCallback(
    (roles = []) => {
      if (!roles?.length) return true;
      const userRoles = auth?.user?.roles ?? [];
      return roles.some((r) => userRoles.includes(r));
    },
    [auth]
  );

  const value = useMemo(
    () => ({
      auth,
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      isAuthenticated: !!auth?.token,
      login,
      register,
      logout,
      isInRole,
      hasAnyRole,
    }),
    [auth, login, register, logout, isInRole, hasAnyRole]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
