import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getMyOrders } from "../../services/orderService";

// Optional helper to format money + date
const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso ?? "";
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI filters (client side)
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | specific status
  const [sort, setSort] = useState("newest"); // "newest" | "oldest" | "total-desc" | "total-asc"

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (e) {
      console.error("Orders load error:", e);
      setErr("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Unique statuses for the filter dropdown
  const availableStatuses = useMemo(() => {
    const set = new Set((orders || []).map((o) => (o.status || "").toLowerCase()));
    return ["all", ...Array.from(set)];
  }, [orders]);

  // Derived view after filter/sort
  const view = useMemo(() => {
    let arr = [...orders];

    if (statusFilter !== "all") {
      arr = arr.filter(
        (o) => (o.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    switch (sort) {
      case "oldest":
        arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "total-desc":
        arr.sort((a, b) => b.total - a.total);
        break;
      case "total-asc":
        arr.sort((a, b) => a.total - b.total);
        break;
      case "newest":
      default:
        arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return arr;
  }, [orders, statusFilter, sort]);

  return (
    <div className="vstack gap-3">
      <h2 className="h5 mb-0">My Orders</h2>

      {/* Filters */}
      <Row className="g-2">
        <Col xs={12} md={6} lg={4}>
          <Form.Label className="small text-muted">Status</Form.Label>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Form.Label className="small text-muted">Sort</Form.Label>
          <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="total-desc">Highest total</option>
            <option value="total-asc">Lowest total</option>
          </Form.Select>
        </Col>

        <Col xs={12} md="auto" className="d-flex align-items-end">
          <Button variant="outline-secondary" onClick={load}>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Loading / Error / Empty states */}
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {err && !loading && <Alert variant="danger">{err}</Alert>}

      {!loading && !err && view.length === 0 && (
        <Alert variant="light" className="border">
          No orders found.
        </Alert>
      )}

      {/* Orders grid */}
      <Row xs={1} className="g-3">
        {view.map((o) => (
          <Col key={o.id}>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                <div>
                  <div className="fw-semibold">
                    Order #{o.id}{" "}
                    <Badge bg="light" text="dark" className="border ms-2">
                      {o.status || "—"}
                    </Badge>
                  </div>
                  <div className="text-muted small">Placed: {fmtDate(o.createdAt)}</div>
                  <div className="text-muted small">
                    Items: {(o.items || []).reduce((s, it) => s + (it.quantity || 0), 0)}
                  </div>
                </div>

                <div className="ms-md-auto text-md-end">
                  <div className="h6 mb-2 mb-md-1">Total: {fmtMoney(o.total)}</div>
                  <Button as={Link} to={`/account/orders/${o.id}`} size="sm">
                    View details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
