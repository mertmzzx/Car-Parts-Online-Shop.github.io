import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <Navbar bg="light" expand="md">
      <Container>
        <Navbar.Brand as={Link} to="/">Car Parts Shop</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/products">Products</Nav.Link>
            <Nav.Link as={NavLink} to="/cart">Cart</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/auth/login">Login</Nav.Link>
            <Nav.Link as={NavLink} to="/auth/register">Register</Nav.Link>
            <Nav.Link as={NavLink} to="/account/overview">My Account</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
