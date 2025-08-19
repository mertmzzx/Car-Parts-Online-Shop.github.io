import { Accordion, Table, Button, Badge, Dropdown, Pagination } from "react-bootstrap";
import { useState, useEffect } from "react";
import http from "../api/http";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // how many per page
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/api/orders", { params: { page, pageSize } });

        // read X-Total-Count header (API must expose it in CORS)
        const totalCount = parseInt(res.headers["x-total-count"] ?? "0", 10);
        setTotal(Number.isNaN(totalCount) ? 0 : totalCount);

        const data = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);

        const mapped = data.map(o => {
          // Try multiple shapes for customer
          const c = o.customer || {};
          const customerFirst = o.customerFirstName ?? c.firstName ?? "";
          const customerLast  = o.customerLastName  ?? c.lastName  ?? "";

          // build a full name safely
          const fullName = [customerFirst, customerLast].filter(Boolean).join(" ").trim();

          // prefer explicit name from API, otherwise our fullName, then fallback to c.name, then ""
          const customerName =
          o.customerName ?? (fullName || c.name || "");

          const customerEmail = o.customerEmail ?? c.email ?? "";
          const customerPhone = o.customerPhone ?? c.phone ?? c.phoneNumber ?? "";

          // Delivery info: use combined field if present, else stitch from parts
          const deliveryAddress =
            o.deliveryAddress ??
            o.shippingAddress ??
            [
              o.addressLine1 ?? c.addressLine1,
              o.addressLine2 ?? c.addressLine2,
              [o.city ?? c.city, o.state ?? c.state].filter(Boolean).join(", "),
              (o.postalCode ?? c.postalCode),
              (o.country ?? c.country),
            ]
              .filter(Boolean)
              .join(" • ");

          return {
            id: o.id,
            customerId: o.customerId,
            createdAt: o.createdAt,
            status: o.status || "Pending",
            total: o.total ?? 0,

            // NEW (optional info, safe if API doesn’t send it)
            customerName: customerName || "-",
            customerEmail: customerEmail || "-",
            customerPhone: customerPhone || "-",
            deliveryAddress: deliveryAddress || "-",

            items: (o.items || []).map(i => ({
              partId: i.partId,
              partName: i.partName,
              sku: i.sku,
              quantity: i.quantity,
              unitPrice: i.unitPrice
            }))
          };
        });

        setOrders(mapped);
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    })();
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "dark";
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleDelete = (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Orders</h2>
      </div>

      {/* Pagination Controls */}
      <Pagination className="mb-3">
        <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
        <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} />
        <Pagination.Item active>{page}</Pagination.Item>
        <Pagination.Next disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
        <Pagination.Last disabled={page === totalPages} onClick={() => setPage(totalPages)} />
      </Pagination>

      <Accordion defaultActiveKey="0" alwaysOpen={false}>
        {orders.map((order, idx) => (
          <Accordion.Item eventKey={String(idx)} key={order.id}>
            <Accordion.Header>
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <strong>Order #{order.id}</strong> &nbsp;|&nbsp; Customer ID: {order.customerId} &nbsp;|&nbsp;
                  {new Date(order.createdAt).toLocaleString()}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg={getStatusVariant(order.status)}>{order.status}</Badge>
                  <span className="ms-2">${order.total.toFixed(2)}</span>

                  {/* Stop click from toggling the accordion when using the dropdown/button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      onSelect={(status) => handleStatusChange(order.id, status)}
                      align="end"
                    >
                      <Dropdown.Toggle size="sm" variant="outline-primary" id={`status-${order.id}`}>
                        Update Status
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {["Pending", "Shipped", "Delivered", "Cancelled"].map((s) => (
                          <Dropdown.Item key={s} eventKey={s}>
                            {s}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              </div>
            </Accordion.Header>

            <Accordion.Body>
              {/* NEW: Customer & Delivery info */}
              <div className="mb-3">
                <div><strong>Customer:</strong> {order.customerName}</div>
                <div><strong>Email:</strong> {order.customerEmail}</div>
                <div><strong>Phone:</strong> {order.customerPhone}</div>
                <div><strong>Delivery:</strong> {order.deliveryAddress}</div>
              </div>

              <Table striped bordered size="sm" responsive>
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.partName}</td>
                      <td>{item.sku}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
}
