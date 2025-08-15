import { useEffect } from "react"; 
import { Card, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    http.get("/api/orders/recent?limit=1")
      .then(res => {
        console.log("✅ API connected. Status:", res.status);
        console.log("Sample data:", res.data);
      })
      .catch(err => {
        console.error("❌ API connection failed:", err.message);
      });
  }, []);

  const summary = {
    totalOrders: 128,
    totalUsers: 42,
    totalRevenue: 19500.75,
    lowStockCount: 6,
  };

  const recentOrders = [
    { id: 101, customer: "John Doe", status: "Pending", total: 99.99, createdAt: "2025-08-13" },
    { id: 102, customer: "Jane Smith", status: "Shipped", total: 149.99, createdAt: "2025-08-12" },
    { id: 103, customer: "Alex Johnson", status: "Delivered", total: 89.5, createdAt: "2025-08-11" },
  ];

  const mockAdminLogs = [
    {
      id: 1,
      timestamp: "2025-08-14T12:34:56Z",
      user: "admin@example.com",
      action: "Changed role of john.doe@example.com from Customer to SalesAssistant"
    },
    {
      id: 2,
      timestamp: "2025-08-14T10:22:33Z",
      user: "admin@example.com",
      action: "Cancelled order #102"
    },
    {
      id: 3,
      timestamp: "2025-08-13T18:10:01Z",
      user: "admin@example.com",
      action: "Deleted user jane.doe@example.com"
    }
  ];

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card bg="primary" text="white" className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <h3>{summary.totalOrders}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="success" text="white" className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <h3>{summary.totalUsers}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="warning" text="dark" className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Revenue</Card.Title>
              <h3>${summary.totalRevenue.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="danger" text="white" className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Low Stock</Card.Title>
              <h3>{summary.lowStockCount}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">📦 Recent Orders</h5>
          <Button variant="outline-primary" size="sm" onClick={() => navigate("/orders")}>
            View All Orders
          </Button>
        </Card.Header>
        <Card.Body>
          <Table striped hover size="sm">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.status}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>{order.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Quick Access */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5>🚀 Quick Access</h5>
        </Card.Header>
        <Card.Body className="d-flex gap-3 flex-wrap">

          {user?.roles?.includes("Administrator") && (
          <Button variant="primary" onClick={() => navigate("/users")}>
          Manage Users
          </Button>
          )}

          <Button variant="success" onClick={() => navigate("/products")}>Manage Products</Button>
          <Button variant="info" onClick={() => navigate("/orders")}>Manage Orders</Button>
        </Card.Body>
      </Card>

      {/* Admin Logs */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5>📝 Admin Logs</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockAdminLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.user}</td>
                  <td>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
