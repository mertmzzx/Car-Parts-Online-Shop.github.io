// src/components/Header.js
import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink, Link } from "react-router-dom";

export default function Header() {
  
  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm border-bottom sticky-top">
        <Container fluid className="px-3 px-md-4">
          {/* Bigger logo */}
          <Navbar.Brand as={Link} to="/" className="brand-strong">
            CarPartsShop
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-3 me-auto nav-polished gap-1 gap-md-2">
              <Nav.Link
                as={NavLink}
                to="/products"
                className={({ isActive }) => "px-2 px-md-3" + (isActive ? " active" : "")}
              >
                Products
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/about"
                className={({ isActive }) => "px-2 px-md-3" + (isActive ? " active" : "")}
              >
                About Us
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/contact"
                className={({ isActive }) => "px-2 px-md-3" + (isActive ? " active" : "")}
              >
                Contact
              </Nav.Link>
            </Nav>

            <Nav className="ms-auto nav-polished">
              <Nav.Link
                as={NavLink}
                to="/account"
                className={({ isActive }) => "px-2 px-md-3" + (isActive ? " active" : "")}
              >
                My Account
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
