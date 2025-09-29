export default function RoleBadge({ role }) {
  if (!role) return null;
  // "Administrator", "SalesAssistant", "Customer"
  const key = String(role).toLowerCase();
  return <span className={`role-badge role-${key}`}>{role}</span>;
}