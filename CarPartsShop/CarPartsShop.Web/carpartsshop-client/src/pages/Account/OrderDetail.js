// src/pages/Account/OrderDetail.js
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders } from "../../services/orderService";
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
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true); setErr("");
            try {
                const data = await getMyOrders;
                if (!ignore) setOrder(data);
            } catch {
                if (!ignore) setErr("Failed to load order.");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => { ignore = true; };
    });

    const items = useMemo(
        () => order?.items ?? order?.orderItems ?? [],
        [order]
    );

    const totals = useMemo(() => {
        const subtotal = items.reduce(
            (s, it) => s + (Number(it.unitPrice ?? it.price ?? 0) * (it.quantity ?? it.qty ?? 1)),
            0
        );
        const shipping = Number(order?.shipping ?? 0);
        const total = Number(order?.total ?? order?.grandTotal ?? subtotal + shipping);
        return { subtotal, shipping, total };
    }, [items, order]);

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
                    <small className="text-muted">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</small>
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
                                        const product = it.part ?? it.product ?? {};
                                        const name = product.name ?? it.name ?? "Item";
                                        const pid = product.id ?? it.partId ?? it.productId;
                                        const price = Number(it.unitPrice ?? it.price ?? 0);
                                        const qty = it.quantity ?? it.qty ?? 1;
                                        const line = price * qty;
                                        return (
                                            <tr key={i}>
                                                <td>
                                                    {pid ? <Link to={`/products/${pid}`}>{name}</Link> : name}
                                                    {product.sku && <div className="text-muted small">SKU: {product.sku}</div>}
                                                </td>
                                                <td className="text-end">${price.toFixed(2)}</td>
                                                <td className="text-end">{qty}</td>
                                                <td className="text-end">${line.toFixed(2)}</td>
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
                                <span>${totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Shipping</span>
                                <span>${totals.shipping.toFixed(2)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-semibold">
                                <span>Total</span>
                                <span>${totals.total.toFixed(2)}</span>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Optional address blocks if your API returns them */}
                    {order?.shippingAddress && (
                        <Card className="border-0 shadow-sm mt-3">
                            <Card.Body>
                                <h3 className="h6 mb-2">Shipping address</h3>
                                <div className="text-muted small">
                                    {order.shippingAddress.fullName}<br />
                                    {order.shippingAddress.line1}<br />
                                    {order.shippingAddress.line2 && (<>{order.shippingAddress.line2}<br /></>)}
                                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                                    {order.shippingAddress.country}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
                <Link to="/account/orders" className="btn btn-primary">All orders</Link>
            </div>
        </div>
    );
}
