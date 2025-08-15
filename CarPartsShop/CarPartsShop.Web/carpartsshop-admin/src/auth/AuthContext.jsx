import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import http from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  // keep axios header stored
  useEffect(() => {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  }, [token]);

  // validate token on mount or when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem("auth_user");
      return;
    }

    try {
      const payload = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        // token expired
        setToken(null);
        setUser(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        return;
      }

      if (!user) {
        // reconstruct a minimal user from token if backend didn't save one
        const roles =
          payload["role"] ||
          payload["roles"] ||
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"] ||
          [];
        const rolesArr = Array.isArray(roles) ? roles : [roles].filter(Boolean);
        const u = { email: payload.email || payload.sub || "user", roles: rolesArr };
        setUser(u);
        localStorage.setItem("auth_user", JSON.stringify(u));
      }
    } catch {
      // bad token
      setToken(null);
      setUser(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  }, [token]); // eslint-disable-line

  const parseRolesFromToken = (jwt) => {
    try {
      const payload = jwtDecode(jwt);
      const roleCandidates = [
        "role",
        "roles",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/roles",
      ];
      for (const k of roleCandidates) {
        if (payload[k]) return Array.isArray(payload[k]) ? payload[k] : [payload[k]];
      }
      return [];
    } catch {
      return [];
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await http.post("/api/auth/login", { email, password });
      const jwt = data?.token;
      if (!jwt) throw new Error("No token in response");

      const roles = parseRolesFromToken(jwt);
      const u = data.user ? { ...data.user, roles } : { email, roles };

      setToken(jwt);
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));

      return { ok: true, user: u };
    } catch (err) {
      const msg =
        err?.response?.status === 401 ? "Invalid email or password." : (err?.message || "Login failed.");
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
