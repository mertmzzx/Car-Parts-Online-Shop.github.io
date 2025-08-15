import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://localhost:7127", // ← your API origin (match Swagger)
  withCredentials: false,
});

// Attach token on each request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      // soft redirect (don’t hard crash UI)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default http;
