import { useState } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";     // ← NEW: to read roles
import http from "../api/http";                    // ← NEW: to call API

const initialProducts = [
  { id: 1, name: "Oil Filter", sku: "OF123", price: 12.5, stock: 100 },
  { id: 2, name: "Brake Pads", sku: "BP456", price: 45.0, stock: 40 },
  { id: 3, name: "Spark Plug", sku: "SP789", price: 9.99, stock: 200 },
];

export default function Products() {
  const { user } = useAuth();                       // ← NEW
  const roles = user?.roles || [];                  // ← NEW
  const isAdmin = roles.includes("Administrator");  // ← NEW
  const canEdit = isAdmin || roles.includes("SalesAssistant"); // ← NEW

  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const openModal = (product = null) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSave = (e) => {
    e.preventDefault();

    const form = e.target;
    const newProduct = {
      id: editingProduct?.id || Date.now(),
      name: form.name.value,
      sku: form.sku.value,
      price: parseFloat(form.price.value),
      stock: parseInt(form.stock.value),
    };

    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? newProduct : p)));
    } else {
      setProducts([...products, newProduct]);
    }

    closeModal();
  };

  // UPDATED: call API to let backend enforce admin-only delete (403 for SA)
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      // Adjust path if your backend route differs (e.g., /api/products/{id})
      await http.delete(`/api/parts/${id}`);
      // If server accepted, reflect change in UI
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        alert("Forbidden: only administrators can delete products.");
      } else if (status === 404) {
        alert("Product not found on server.");
      } else {
        alert(err?.response?.data || "Delete failed.");
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Product Management</h2>
        {canEdit && (
          <Button variant="success" onClick={() => openModal()}>
            + New Product
          </Button>
        )}
      </div>

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Search by name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="me-2"
                    onClick={() => openModal(p)}
                  >
                    Edit
                  </Button>
                )}

                {/* Delete shown only for Admins; API still enforces 403 anyway */}
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={closeModal}>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editingProduct ? "Edit Product" : "New Product"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" defaultValue={editingProduct?.name || ""} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>SKU</Form.Label>
              <Form.Control name="sku" defaultValue={editingProduct?.sku || ""} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" step="0.01" name="price" defaultValue={editingProduct?.price || ""} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" name="stock" defaultValue={editingProduct?.stock || ""} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
