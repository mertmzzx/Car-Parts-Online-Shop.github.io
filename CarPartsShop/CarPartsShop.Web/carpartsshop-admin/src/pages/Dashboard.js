// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Table, Badge } from "react-bootstrap";
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
      .then((res) => setSummary((prev) => ({ ...prev, ...(res.data || {}) })))
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
 
  const statusBadgeVariant = (s) => {
    const k = String(s || "").toLowerCase();
    if (k === "pending") return "secondary";
    if (k === "shipped") return "info";
    if (k === "delivered") return "success";
    if (k === "cancelled" || k === "canceled") return "danger";
    return "dark";
    };
 
  const logKey = (l) =>
    l.id ??
    l.Id ??
    `${(l.timestamp || l.Timestamp || l.occurredAt || l.OccurredAt || "")}-${
      l.user || l.userEmail || l.performedBy || l.PerformedBy || ""
    }-${l.action || l.message || l.Message || ""}`;
 
  const logWhen = (l) =>
    new Date(
      l.timestamp ?? l.Timestamp ?? l.occurredAt ?? l.OccurredAt ?? Date.now()
    ).toLocaleString();
  const logUser = (l) =>
    l.user ?? l.userEmail ?? l.performedBy ?? l.PerformedBy ?? "—";
  const logAction = (l) => l.action ?? l.message ?? l.Message ?? "—";
 
  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
 
      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
            <Card.Body className="text-center">
              <div className="text-muted mb-1">Total Orders</div>
              <div className="fs-2 fw-bold">{summary.totalOrders ?? 0}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
            <Card.Body className="text-center">
              <div className="text-muted mb-1">Total Users</div>
              <div className="fs-2 fw-bold text-success">
                {summary.totalUsers ?? 0}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
            <Card.Body className="text-center">
              <div className="text-muted mb-1">Total Revenue</div>
              <div className="fs-2 fw-bold text-warning">
                ${formatMoney(summary.totalRevenue)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
            <Card.Body className="text-center">
              <div className="text-muted mb-1">Low Stock</div>
              <div className="fs-2 fw-bold text-danger">
                {summary.lowStockCount ?? 0}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
 
      {/* Recent Orders */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 14 }}>
        <Card.Header className="d-flex justify-content-between align-items-center bg-white">
          <h5 className="mb-0">📦 Recent Orders</h5>
          <Button variant="outline-primary" size="sm" onClick={() => navigate("/orders")}>
            View All Orders
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive table-card">
            <Table className="table-modern align-middle">
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
                    <td colSpan={5} className="text-center text-muted py-4">
                      No recent orders.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={orderId(o)}>
                      <td className="fw-semibold">#{orderId(o)}</td>
                      <td>{orderCustomerText(o)}</td>
                      <td>
                        <Badge bg={statusBadgeVariant(orderStatus(o))}>
                          {orderStatus(o)}
                        </Badge>
                      </td>
                      <td>${formatMoney(orderTotal(o))}</td>
                      <td>{orderDate(o)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
 
      {/* Quick Access */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 14 }}>
        <Card.Header className="bg-white">
          <h5 className="mb-0">🚀 Quick Access</h5>
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
 
      {/* Admin Logs (Admins only) */}
      {user?.roles?.includes("Administrator") && (
        <Card className="shadow-sm border-0" style={{ borderRadius: 14 }}>
          <Card.Header className="bg-white">
            <h5 className="mb-0">📝 Admin Logs</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive table-card">
              <Table className="table-modern align-middle">
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
                      <td colSpan={3} className="text-center text-muted py-4">
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
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}