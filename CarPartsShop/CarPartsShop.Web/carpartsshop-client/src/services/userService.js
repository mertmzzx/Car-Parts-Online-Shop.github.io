import api from "./http";

// GET /api/Users/me  → { email, firstName, lastName, roles:[] }
export async function getMe() {
  const { data } = await api.get("/api/Users/me");
  // normalize casing just in case
  return {
    email: data.Email ?? data.email ?? "",
    firstName: data.FirstName ?? data.firstName ?? "",
    lastName: data.LastName ?? data.lastName ?? "",
    roles: data.Roles ?? data.roles ?? [],
  };
}

// PUT /api/Users/me  → body { firstName, lastName }
export async function updateProfile({ firstName, lastName }) {
  const { data } = await api.put("/api/Users/me", { firstName, lastName });
  return data;
}

// POST /api/Users/change-password → body { currentPassword, newPassword }
export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.post("/api/Users/change-password", { currentPassword, newPassword });
  return data;
}
