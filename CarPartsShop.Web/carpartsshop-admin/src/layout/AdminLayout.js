// src/layout/AdminLayout.jsx
import { useMemo, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";

import {
  FiGrid,
  FiFileText,
  FiPackage,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiUser,
} from "react-icons/fi";

// tiny, inline color-coded role pill
const RolePill = ({ role }) => {
  if (!role) return null;
  const key = String(role).toLowerCase(); // "administrator" | "salesassistant" | "customer"
  return <span className={`role-badge role-${key}`}>{role}</span>;
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const roles = useMemo(() => (Array.isArray(user?.roles) ? user.roles : []), [user]);
  const isAdmin = roles.includes("Administrator");

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <FiGrid /> },
    { to: "/orders", label: "Orders", icon: <FiFileText /> },
    { to: "/products", label: "Products", icon: <FiPackage /> },
    ...(isAdmin ? [{ to: "/users", label: "Users", icon: <FiUsers /> }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`adm-shell ${open ? "is-open" : ""}`}>
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <button
            className="adm-burger d-md-none"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <FiMenu />
          </button>
          <div className="adm-logo">
            Silver Star <span>Parts</span>
          </div>
        </div>

        {user ? (
          <>
            <nav className="adm-nav">
              {navItems.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    "adm-link" + (isActive ? " active" : "")
                  }
                  onClick={() => setOpen(false)}
                >
                  <span className="icon">{it.icon}</span>
                  <span className="label">{it.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Restyled footer user card */}
            <div className="adm-footer">
              <div className="adm-user-card">
                <div className="adm-user-avatar">
                  <FiUser />
                </div>
                <div className="adm-user-info">
                  <div className="email">{user?.email}</div>

                  {/* Color-coded role badges */}
                  <div className="d-flex flex-wrap gap-1">
                    {(Array.isArray(roles) ? roles : []).map((r) => (
                      <RolePill key={r} role={r === "Admin" ? "Administrator" : r} />
                    ))}
                  </div>
                </div>
              </div>

              <button className="adm-logout" onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : null}
      </aside>

      {/* Content area */}
      <main className="adm-content">
        <Outlet />
      </main>

      {/* Backdrop for mobile */}
      <div
        className="adm-backdrop d-md-none"
        onClick={() => setOpen(false)}
      />
    </div>
  );
}
