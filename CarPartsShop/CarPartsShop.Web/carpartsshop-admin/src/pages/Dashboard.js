import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- State (live data) ---
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);

  // --- Load dashboard data ---
  useEffect(() => {
    // Stats
    http
      .get("/api/admin/stats")
      .then((res) => {
        // Expecting: { totalOrders, totalUsers, totalRevenue, lowStockCount }
        setSummary((prev) => ({ ...prev, ...(res.data || {}) }));
      })
      .catch((err) => console.error("❌ Failed to load stats", err));

    // Recent orders
    http
      .get("/api/orders/recent?limit=5")
      .then((res) => setRecentOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("❌ Failed to load recent orders", err));

    // Admin logs
    http
      .get("/api/admin/logs?limit=10")
      .then((res) => setAdminLogs(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("❌ Failed to load admin logs", err));
  }, []);

  // --- Helpers to render with flexible DTO field names ---
  const formatMoney = (n) =>
    typeof n === "number" ? n.toFixed(2) : Number(n || 0).toFixed(2);

  const orderId = (o) => o.id ?? o.Id;
  const orderCustomerText = (o) =>
    o.customer ??
    o.customerName ??
    `Customer #${o.customerId ?? o.CustomerId ?? "?"}`;
  const orderStatus = (o) => o.status ?? o.Status ?? "Unknown";
  const orderTotal = (o) => o.total ?? o.Total ?? 0;
  const orderDate = (o) =>
    new Date(o.createdAt ?? o.CreatedAt ?? Date.now()).toLocaleString();

  const logKey = (l) => l.id ?? l.Id ?? `${(l.timestamp || l.Timestamp || l.occurredAt || l.OccurredAt || "")}-${(l.user || l.userEmail || l.performedBy || l.PerformedBy || "")}-${(l.action || l.message || l.Message || "")}`;
  const logWhen = (l) =>
    new Date(l.timestamp ?? l.Timestamp ?? l.occurredAt ?? l.OccurredAt ?? Date.now()).toLocaleString();
  const logUser = (l) => l.user ?? l.userEmail ?? l.performedBy ?? l.PerformedBy ?? "—";
  const logAction = (l) => l.action ?? l.message ?? l.Message ?? "—";

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card bg="primary" text="white" className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <h3>{summary.totalOrders ?? 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="success" text="white" className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <h3>{summary.totalUsers ?? 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="warning" text="dark" className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Revenue</Card.Title>
              <h3>${formatMoney(summary.totalRevenue)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="danger" text="white" className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Low Stock</Card.Title>
              <h3>{summary.lowStockCount ?? 0}</h3>
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No recent orders.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={orderId(o)}>
                    <td>#{orderId(o)}</td>
                    <td>{orderCustomerText(o)}</td>
                    <td>{orderStatus(o)}</td>
                    <td>${formatMoney(orderTotal(o))}</td>
                    <td>{orderDate(o)}</td>
                  </tr>
                ))
              )}
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
          <Button variant="success" onClick={() => navigate("/products")}>
            Manage Products
          </Button>
          <Button variant="info" onClick={() => navigate("/orders")}>
            Manage Orders
          </Button>
        </Card.Body>
      </Card>

      {/* Admin Logs */}
      {user?.roles?.includes("Administrator") && (
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
              {adminLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    No recent admin activity.
                  </td>
                </tr>
              ) : (
                adminLogs.map((log) => (
                  <tr key={logKey(log)}>
                    <td>{logWhen(log)}</td>
                    <td>{logUser(log)}</td>
                    <td>{logAction(log)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      )}
    </div>
  );
}
