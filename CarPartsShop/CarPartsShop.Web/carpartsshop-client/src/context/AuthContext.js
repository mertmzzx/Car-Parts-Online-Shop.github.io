import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api from "../services/http";
import { login as apiLogin, register as apiRegister } from "../services/authService";

const STORAGE_KEY = "cps_auth_client_v1";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// --- helpers ---------------------------------------------------------------

// safe base64url decode -> JSON
function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}
function getJwtExpMillis(token) {
  const payload = decodeJwt(token);
  // exp is in seconds since epoch
  const expSec = payload?.exp;
  return typeof expSec === "number" ? expSec * 1000 : null;
}

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

// --------------------------------------------------------------------------

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

  // Persist to storage
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

  // allow updating just parts of the user object
  const updateUser = useCallback((patch) => {
    setAuth((a) => (a ? { ...a, user: { ...a.user, ...patch } } : a));
  }, []);

  // auto-logout when token expires (timer-based) 
  useEffect(() => {
    if (!auth?.token) return;

    const expMs = getJwtExpMillis(auth.token);
    if (!expMs) return; // token has no exp, skip

    // logout 5s before expiration
    const now = Date.now();
    const delay = Math.max(0, expMs - now - 5000);

    const timer = setTimeout(() => {
      logout();
    }, delay);

    return () => clearTimeout(timer);
  }, [auth?.token, logout]);

  // auto-logout on 401 invalid/expired token (response interceptor)
  useEffect(() => {
    const id = api.interceptors.response.use(
      (resp) => resp,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          // Try to pick hints from body or WWW-Authenticate header
          const body = error?.response?.data;
          const hdr = error?.response?.headers?.["www-authenticate"] || "";
          const message =
            (typeof body === "string" ? body : "") +
            " " +
            (typeof body?.error_description === "string" ? body.error_description : "") +
            " " +
            hdr;

          // Look for common indicators
          if (/invalid[_\s-]?token|expired|token expired|jwt/i.test(message)) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(id);
  }, [logout]);

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
      updateUser,
    }),
    [auth, login, register, logout, isInRole, hasAnyRole, updateUser]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
