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
  try {
    const res = await apiLogin({ email, password });
    const normalized = normalizeAuth(res);
    if (!normalized?.token) {
      // bubble up any backend text or validation payload if present
      const msg =
        (typeof res === "string" && res) ||
        res?.message ||
        "Invalid auth response.";
      throw new Error(msg);
    }
    setAuth(normalized);
    return normalized;
  } catch (err) {
    // map axios/HTTP errors to a readable message
    const msg =
      err?.response?.data?.title ||       // ProblemDetails.Title
      err?.response?.data?.error ||       // custom error
      err?.response?.data ||              // plain text or object
      err?.message || "Login failed.";
    throw new Error(
      typeof msg === "string" ? msg : "Login failed."
    );
  }
}, []);

const register = useCallback(async (payload) => {
  try {
    const res = await apiRegister(payload);
    const normalized = normalizeAuth(res);
    if (!normalized?.token) {
      const msg =
        (typeof res === "string" && res) ||
        res?.message ||
        "Invalid auth response.";
      throw new Error(msg);
    }
    setAuth(normalized);
    return normalized;
  } catch (err) {
    const msg =
      err?.response?.data?.title ||
      err?.response?.data?.error ||
      err?.response?.data ||
      err?.message || "Registration failed.";
    throw new Error(
      typeof msg === "string" ? msg : "Registration failed."
    );
  }
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

  // ✅ NEW: allow updating just parts of the user object
  const updateUser = useCallback((patch) => {
    setAuth((a) =>
      a ? { ...a, user: { ...a.user, ...patch } } : a
    );
  }, []);

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
      updateUser, // ✅ expose it
    }),
    [auth, login, register, logout, isInRole, hasAnyRole, updateUser]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
