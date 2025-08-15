import { useState } from "react";
import { Accordion, Table, Button, Badge, Dropdown } from "react-bootstrap";

const mockOrders = [
  {
    id: 1,
    customerId: 101,
    createdAt: "2025-08-14T10:30:00Z",
    status: "Pending",
    total: 79.98,
    items: [
      { partId: 1, partName: "Oil Filter", sku: "OF123", quantity: 2, unitPrice: 19.99 },
      { partId: 2, partName: "Brake Pads", sku: "BP456", quantity: 1, unitPrice: 39.99 },
    ],
  },
  {
    id: 2,
    customerId: 102,
    createdAt: "2025-08-13T15:45:00Z",
    status: "Shipped",
    total: 45.0,
    items: [{ partId: 3, partName: "Spark Plug", sku: "SP789", quantity: 5, unitPrice: 9.0 }],
  },
];

export default function Orders() {
  const [orders, setOrders] = useState(mockOrders);

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

      {/* defaultActiveKey opens the first item initially; remove if you want all collapsed */}
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
