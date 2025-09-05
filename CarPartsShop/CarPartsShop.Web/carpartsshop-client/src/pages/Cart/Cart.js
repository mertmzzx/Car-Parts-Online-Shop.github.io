// src/pages/Cart/Cart.js
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Table,
  Image,
  Form,
  Alert,
  Card,
} from "react-bootstrap";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const { items, remove, clear, setQty } = useCart();

  // Compute subtotal from qty
  const subtotal = useMemo(
    () =>
      (items || []).reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0),
        0
      ),
    [items]
  );

  // placeholders (wire real values later)
  const taxRate = 0.0; // e.g., 0.2 for 20%
  const shipping = subtotal > 0 ? 0 : 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax + shipping;

  // Helpers to clamp & set quantity
  function clampQty(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, Math.min(99, n));
  }

  function handleSetQty(id, v) {
    setQty(id, clampQty(v));
  }

  function inc(id) {
    const line = items.find((x) => x.id === id);
    if (!line) return;
    handleSetQty(id, (Number(line.qty) || 0) + 1);
  }

  function dec(id) {
    const line = items.find((x) => x.id === id);
    if (!line) return;
    handleSetQty(id, Math.max(1, (Number(line.qty) || 0) - 1));
  }

  if (!items || items.length === 0) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center py-5">
            <h3 className="h5 mb-2">Your cart is empty</h3>
            <p className="text-muted mb-4">
              Browse our catalog and add some parts to your cart.
            </p>
            <Button as={Link} to="/products">Go to Products</Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      <Row className="g-4">
        {/* Items */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h1 className="h5 mb-0">Shopping Cart</h1>
                <Button variant="outline-danger" size="sm" onClick={clear}>
                  Clear cart
                </Button>
              </div>

              <Table responsive hover className="align-middle mb-0">
                <thead className="text-muted small">
                  <tr>
                    <th style={{ width: 72 }}></th>
                    <th>Product</th>
                    <th style={{ width: 110 }} className="text-end">Price</th>
                    <th style={{ width: 180 }} className="text-center">Quantity</th>
                    <th style={{ width: 120 }} className="text-end">Subtotal</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const lineTotal =
                      (Number(it.price) || 0) * (Number(it.qty) || 0);
                    return (
                      <tr key={it.id}>
                        <td>
                          <Image
                            src={
                              it.imageUrl ||
                              "https://placehold.co/80x60?text=Part"
                            }
                            alt={it.name}
                            thumbnail
                            style={{ width: 72, height: 54, objectFit: "cover" }}
                          />
                        </td>
                        <td>
                          <div className="fw-semibold">{it.name}</div>
                          <div className="text-muted small">
                            SKU: {it.sku || "-"}
                          </div>
                        </td>
                        <td className="text-end">
                          ${Number(it.price).toFixed(2)}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => dec(it.id)}
                              aria-label="Decrease quantity"
                            >
                              −
                            </Button>
                            <Form.Control
                              size="sm"
                              type="number"
                              value={it.qty}
                              min={1}
                              max={99}
                              onChange={(e) => handleSetQty(it.id, e.target.value)}
                              style={{ width: 64, textAlign: "center" }}
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => inc(it.id)}
                              aria-label="Increase quantity"
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="text-end">
                          ${Number(lineTotal).toFixed(2)}
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => remove(it.id)}
                            aria-label="Remove item"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <div className="mt-3">
            <Button as={Link} to="/products" variant="outline-secondary">
              Continue shopping
            </Button>
          </div>
        </Col>

        {/* Summary */}
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h2 className="h6 mb-3">Order Summary</h2>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-semibold">Total</span>
                <span className="fw-bold">${total.toFixed(2)}</span>
              </div>
              <div className="d-grid gap-2">
                <Button size="lg" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                </Button>
              </div>

              <Alert variant="light" className="mt-3 border">
                <div className="small text-muted mb-1">
                  You can check out as a guest or sign in during checkout.
                </div>
                <div className="small">
                  Prices include VAT where applicable. Shipping calculated at
                  next step.
                </div>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
