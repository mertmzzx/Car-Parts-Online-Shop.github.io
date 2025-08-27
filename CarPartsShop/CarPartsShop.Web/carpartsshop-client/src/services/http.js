import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cps_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

console.log("API base:", api.defaults.baseURL);

export default api;
