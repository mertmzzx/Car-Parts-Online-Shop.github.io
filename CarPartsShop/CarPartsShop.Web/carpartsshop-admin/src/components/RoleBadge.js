export default function RoleBadge({ role }) {
  if (!role) return null;
  // Expecting one of: "Administrator", "SalesAssistant", "Customer"
  const key = String(role).toLowerCase();
  return <span className={`role-badge role-${key}`}>{role}</span>;
}