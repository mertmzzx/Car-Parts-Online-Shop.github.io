import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom"; 
import { getOrderById } from "../../services/orderService";                   
import { Spinner, Alert, Badge, Table, Button, Row, Col, Card } from "react-bootstrap";

const statusVariant = (s) => {
  const v = (s || "").toLowerCase();
  if (v.includes("pending")) return "secondary";
  if (v.includes("processing")) return "info";
  if (v.includes("shipped")) return "primary";
  if (v.includes("delivered")) return "success";
  if (v.includes("cancel")) return "danger";
  return "light";
};

export default function OrderDetail() {
  const { id } = useParams();            
  const location = useLocation();          
  const navigate = useNavigate();

  // Prefer order passed via location.state to avoid refetch on soft nav
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    if (order) return; 

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getOrderById(id);     
        if (!ignore) setOrder(data);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 403) {
          navigate("/forbidden", { replace: true });
          return;
        }
        if (status === 404) {
          navigate("/account/orders", { replace: true, state: { msg: "Order not found." } });
          return;
        }
        if (!ignore) setErr("Failed to load order.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [id, order, navigate]);

  const items = useMemo(() => order?.items ?? [], [order]);

  const totals = useMemo(() => {
    // Use API totals if available; keep a safe fallback
    const subtotal = Number(order?.subtotal ?? 0);
    const total = Number(order?.total ?? 0);
    const tax = Number(order?.tax ?? 0);
    // If shipping is modeled separately later, compute/replace accordingly
    const shipping = Math.max(0, total - subtotal - tax);
    return { subtotal, shipping, total };
  }, [order]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (err) return <Alert variant="danger">{err}</Alert>;
  if (!order) return null;

  return (
    <div className="vstack gap-3">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h2 className="h5 mb-0">Order #{order.id}</h2>
        <div className="d-flex align-items-center gap-2">
          <Badge bg={statusVariant(order.status)}>{order.status || "-"}</Badge>
          <small className="text-muted">
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
          </small>
        </div>
      </div>

      <Row className="g-3">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h3 className="h6 mb-3">Items</h3>
              <Table responsive bordered hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-end" style={{ width: 120 }}>Unit price</th>
                    <th className="text-end" style={{ width: 100 }}>Qty</th>
                    <th className="text-end" style={{ width: 140 }}>Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const name = it.partName ?? it.name ?? "Item";
                    const pid = it.partId ?? it.productId;
                    const price = Number(it.unitPrice ?? it.price ?? 0);
                    const qty = Number(it.quantity ?? it.qty ?? 1);
                    const line = price * qty;
                    return (
                      <tr key={i}>
                        <td>
                          {pid ? <Link to={`/products/${pid}`}>{name}</Link> : name}
                          {it.sku && <div className="text-muted small">SKU: {it.sku}</div>}
                        </td>
                        <td className="text-end">€{price.toFixed(2)}</td>
                        <td className="text-end">{qty}</td>
                        <td className="text-end">€{line.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h3 className="h6 mb-3">Summary</h3>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Subtotal</span>
                <span>€{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Shipping</span>
                <span>€{totals.shipping.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-semibold">
                <span>Total</span>
                <span>€{totals.total.toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex gap-2">
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
        <Link to="/account/orders" className="btn btn-primary">All orders</Link>
      </div>
    </div>
  );
}
