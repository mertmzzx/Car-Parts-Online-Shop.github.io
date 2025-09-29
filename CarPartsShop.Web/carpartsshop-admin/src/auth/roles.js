export const Roles = {
  Administrator: "Administrator",
  SalesAssistant: "Sales Assistant",
  Customer: "Customer",
};

export function hasAnyRole(userRoles, required) {
  const norm = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const have = norm(userRoles).map(String);
  const need = norm(required).map(String);
  return need.some((r) => have.includes(r));
}
