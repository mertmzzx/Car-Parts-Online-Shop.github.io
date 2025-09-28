import api from "./http";

export function getAuthHeader() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMyAddress() {
  const res = await api.get("/api/customers/me/address");
  if (res.status === 204) return null;   
  return res.data ?? null;
}

export async function saveMyAddress(payload) {
  const { data } = await api.put("/api/customers/me/address", payload);
  return data ?? null;
}
