// src/components/Header.js
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
      bg="white"
      expand="lg"
      className="shadow-sm border-bottom sticky-top"
    >
      <Container fluid className="px-3 px-md-4">
        {/* Bigger logo */}
        <Navbar.Brand as={Link} to="/" className="brand-strong">
          CarPartsShop
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          {/* Main nav (center-left) */}
          <Nav className="ms-3 me-auto nav-polished gap-1 gap-md-2">
            <Nav.Link
              as={NavLink}
              to="/products"
              className={({ isActive }) =>
                "px-2 px-md-3" + (isActive ? " active" : "")
              }
            >
              Products
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/about"
              className={({ isActive }) =>
                "px-2 px-md-3" + (isActive ? " active" : "")
              }
            >
              About Us
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/contact"
              className={({ isActive }) =>
                "px-2 px-md-3" + (isActive ? " active" : "")
              }
            >
              Contact
            </Nav.Link>
          </Nav>

          {/* Auth controls (right side) */}
          <Nav className="ms-auto nav-polished gap-2">
            {!isAuthenticated ? (
              <>
                <Nav.Link
                  as={NavLink}
                  to="/login"
                  className={({ isActive }) =>
                    "px-2 px-md-3" + (isActive ? " active" : "")
                  }
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={NavLink}
                  to="/register"
                  className={({ isActive }) =>
                    "px-2 px-md-3" + (isActive ? " active" : "")
                  }
                >
                  Register
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link
                  as={NavLink}
                  to="/account"
                  className={({ isActive }) =>
                    "px-2 px-md-3" + (isActive ? " active" : "")
                  }
                >
                  {"My Account"}
                </Nav.Link>
                <Button
                  variant="outline-secondary"
                  size="sm"
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
