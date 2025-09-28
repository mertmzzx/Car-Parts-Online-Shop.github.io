import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/"); // redirect home
  }

  return (
    <Navbar
      expand="lg"
      bg="white"
      className="shadow-sm sticky-top border-0 header-glass"
    >
      <Container fluid className="px-3 px-md-4">
        {/* Brand */}
        <Navbar.Brand as={Link} to="/" className="brand-strong d-flex align-items-center gap-2">
          <span className="brand-text">Silver Star Parts</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" className="border-0" />
        <Navbar.Collapse id="main-nav">
          {/* Main nav */}
          <Nav className="ms-0 ms-lg-3 me-auto gap-1">
            <Nav.Link
              as={NavLink}
              to="/products"
              className={({ isActive }) => "nav-pill" + (isActive ? " active" : "")}
            >
              Products
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/about"
              className={({ isActive }) => "nav-pill" + (isActive ? " active" : "")}
            >
              About Us
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/contact"
              className={({ isActive }) => "nav-pill" + (isActive ? " active" : "")}
            >
              Contact
            </Nav.Link>
          </Nav>

          {/* Auth controls */}
          <Nav className="ms-auto align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Nav.Link
                  as={NavLink}
                  to="/login"
                  className={({ isActive }) => "btn-ghost" + (isActive ? " active" : "")}
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={NavLink}
                  to="/register"
                  className={({ isActive }) => "btn-cta" + (isActive ? " active" : "")}
                >
                  Register
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link
                  as={NavLink}
                  to="/account"
                  className={({ isActive }) => "btn-ghost" + (isActive ? " active" : "")}
                >
                  My Account
                </Nav.Link>
                <Button
                  variant="outline-dark"
                  size="sm"
                  className="rounded-pill px-3 btn-logout"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
