import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccountOverview() {
  const { user } = useAuth();

  const fullName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.userName || "Customer";

  return (
    <Container fluid className="py-4">
      <h1 className="h4 mb-4">Welcome back, {fullName}!</h1>

      <Row className="g-4">
        <Col md={4}>
          <Card as={Link} to="/account/profile" className="text-decoration-none shadow-sm h-100">
            <Card.Body>
              <Card.Title>Profile</Card.Title>
              <Card.Text className="text-muted">
                Manage your name, email, and password.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card as={Link} to="/account/orders" className="text-decoration-none shadow-sm h-100">
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              <Card.Text className="text-muted">
                Track and view your order history.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card as={Link} to="/account/addresses" className="text-decoration-none shadow-sm h-100">
            <Card.Body>
              <Card.Title>Addresses</Card.Title>
              <Card.Text className="text-muted">
                Save and manage shipping addresses.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
