// src/pages/Account/AccountLayout.js
import { Container, Row, Col, Nav } from "react-bootstrap";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccountLayout() {
  const { logout} = useAuth();
  const navigate = useNavigate();

  return (
    <Container fluid className="py-4 px-3 px-md-4">
      <Row className="g-4">
        {/* Sidebar */}
        <Col xs={12} md={3} lg={2}>
          <div className="p-3 rounded border bg-white shadow-sm">
            <div className="mb-3">
            </div>
            <Nav variant="pills" className="flex-column gap-1 account-nav">
              <Nav.Link as={NavLink} to="/account" end>
                Overview
              </Nav.Link>
              <Nav.Link as={NavLink} to="/account/profile">
                Profile
              </Nav.Link>
              <Nav.Link as={NavLink} to="/account/orders">
                Orders
              </Nav.Link>
              <Nav.Link as={NavLink} to="/account/addresses">
                Addresses
              </Nav.Link>

              <div className="border-top my-2" />
              <Nav.Link
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-danger"
              >
                Log out
              </Nav.Link>
            </Nav>
          </div>
        </Col>

        {/* Main content */}
        <Col xs={12} md={9} lg={10}>
          <div className="p-3 p-md-4 rounded border bg-white shadow-sm">
            <Outlet />
          </div>
        </Col>
      </Row>
    </Container>
  );
}
