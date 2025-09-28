import api from "./http";

/** POST /api/Auth/login -> { Token, Role, UserName, FirstName?, LastName? } */
export async function login({ email, password }) {
  const { data } = await api.post("/api/Auth/login", { email, password });
  return data;
}

/** POST /api/Auth/register -> { Token, Role, UserName, FirstName?, LastName? } */
export async function register(payload) {
  // payload: { firstName, lastName, email, password, confirmPassword? }
  const { data } = await api.post("/api/Auth/register", payload);
  return data;
}
