import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7127",
});

// Always attach token 
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("cps_auth_client_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    const token = parsed?.token;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// auto-logout on expired/invalid token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const www = err?.response?.headers?.["www-authenticate"] || "";
    if (
      status === 401 &&
      /invalid_token|expired/i.test(www || String(err?.response?.data || ""))
    ) {
      // clear saved auth and go to login
      localStorage.removeItem("cps_auth_client_v1");
      // avoid loops if already on /login
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?reason=expired");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
