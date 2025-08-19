// src/layout/AdminLayout.jsx
import { useMemo, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Offcanvas,
  Button,
  Badge,
} from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const roles = useMemo(
    () => (Array.isArray(user?.roles) ? user.roles : []),
    [user]
  );
  const isAdmin = roles.includes("Administrator");

  const linkClass = ({ isActive }) =>
    "list-group-item list-group-item-action py-2" +
    (isActive ? " active" : "");

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand>CarPartsShop Admin</Navbar.Brand>

          {/* Right side (desktop) */}
          <Nav className="ms-auto d-none d-md-flex align-items-center gap-3">
            {user ? (
              <>
                <span className="text-light small">
                  Signed in as: <strong>{user.email}</strong>
                </span>
                {roles.length > 0 && <Badge bg="info">{roles.join(", ")}</Badge>}
                <Button size="sm" variant="outline-light" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link text-light">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-outline-light btn-sm">
                  Register
                </NavLink>
              </>
            )}
          </Nav>

          {/* Mobile menu toggle always visible */}
          <Navbar.Toggle onClick={() => setShowMenu(true)} />
        </Container>
      </Navbar>

      {/* Offcanvas (mobile) */}
      <Offcanvas
        show={showMenu}
        onHide={() => setShowMenu(false)}
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {user ? (
            <>
              <Nav className="flex-column list-group list-group-flush">
                <NavLink
                  to="/dashboard"
                  className={linkClass}
                  onClick={() => setShowMenu(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/orders"
                  className={linkClass}
                  onClick={() => setShowMenu(false)}
                >
                  Orders
                </NavLink>
                <NavLink
                  to="/products"
                  className={linkClass}
                  onClick={() => setShowMenu(false)}
                >
                  Products
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/users"
                    className={linkClass}
                    onClick={() => setShowMenu(false)}
                  >
                    Users
                  </NavLink>
                )}
              </Nav>
              <div className="p-3 border-top">
                <div className="small mb-2">
                  <div className="fw-semibold">{user.email}</div>
                  {roles.length > 0 && (
                    <Badge bg="secondary">{roles.join(", ")}</Badge>
                  )}
                </div>
                <Button variant="outline-danger" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            // Public offcanvas when not logged in
            <div className="p-3">
              <Nav className="flex-column gap-2">
                <NavLink
                  to="/login"
                  className="btn btn-outline-primary"
                  onClick={() => setShowMenu(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="btn btn-primary"
                  onClick={() => setShowMenu(false)}
                >
                  Register
                </NavLink>
              </Nav>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid className="mt-3">
        <Row>
          {/* Sidebar only when logged in */}
          {user && (
            <Col md={2} className="d-none d-md-block">
              <div className="list-group sticky-top" style={{ top: 16 }}>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/orders" className={linkClass}>
                  Orders
                </NavLink>
                <NavLink to="/products" className={linkClass}>
                  Products
                </NavLink>
                {isAdmin && (
                  <NavLink to="/users" className={linkClass}>
                    Users
                  </NavLink>
                )}
              </div>
            </Col>
          )}

          <Col xs={12} md={user ? 10 : 12}>
            {/* If this layout ever renders while logged-out, users can still see public pages like /register */}
            <Outlet />
          </Col>
        </Row>
      </Container>
    </>
  );
}
