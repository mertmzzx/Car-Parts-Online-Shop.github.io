import { useEffect, useMemo, useState } from "react";
import { Table, Button, Modal, Form, InputGroup, Pagination, Card } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import http from "../api/http";
 
export default function Products() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes("Administrator");
  const canEdit = isAdmin || roles.includes("SalesAssistant");
 
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
 
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
 
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
 
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/api/categories");
        const items = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setCategories(items.map((c) => ({ id: c.id ?? c.Id, name: c.name ?? c.Name })));
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
  }, []);
 
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/api/parts", { params: { page, pageSize } });
        let totalCount = Number(res.headers?.["x-total-count"]);
        if (!Number.isFinite(totalCount) || totalCount <= 0) {
          const bodyTotal = res.data?.total ?? res.data?.Total;
          totalCount = Number(bodyTotal) || 0;
        }
        setTotal(totalCount);
 
        const items = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        const mapped = items.map((p) => ({
          id: p.id ?? p.Id,
          name: p.name ?? p.Name,
          sku: p.sku ?? p.Sku,
          description: p.description ?? p.Description ?? "",
          price: p.price ?? p.Price,
          quantityInStock: p.quantityInStock ?? p.QuantityInStock,
          categoryId: p.categoryId ?? p.CategoryId,
          categoryName:
            p.categoryName ?? p.CategoryName ?? p.category?.name ?? p.Category?.Name ?? "",
        }));
        setProducts(mapped);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    })();
  }, [page, pageSize]);
 
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
 
  const openModal = (product = null) => { setEditingProduct(product); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingProduct(null); };
 
  function readApiError(err) {
    const r = err?.response;
    if (!r) return err?.message || "Network error";
    if (typeof r.data === "string") return r.data;
    if (r.data?.message) return r.data.message;
    if (r.data?.title) return r.data.title;
    try { return JSON.stringify(r.data); } catch { return `HTTP ${r.status}`; }
  }
 
  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
 
    const payload = {
      id: editingProduct?.id,
      name: form.name.value.trim(),
      sku: form.sku.value.trim(),
      description: (form.description?.value || "").trim(),
      price: Number(form.price.value),
      quantityInStock: Number(form.stock.value),
      categoryId: Number(form.categoryId.value),
    };
 
    if (!payload.name || !payload.sku) { alert("Name and SKU are required."); return; }
    if (!Number.isFinite(payload.price) || !Number.isInteger(payload.categoryId)) {
      alert("Price must be a number and a category must be selected."); return;
    }
 
    try {
      if (editingProduct) {
        const { data: updated } = await http.put(`/api/parts/${editingProduct.id}`, payload);
        setProducts(prev => prev.map(p => (p.id === editingProduct.id ? { ...p, ...updated } : p)));
      } else {
        const { data: created } = await http.post("/api/parts", payload);
        setProducts(prev => [...prev, created]);
      }
      closeModal();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert(`Error saving product: ${readApiError(err)}`);
    }
  };
 
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await http.delete(`/api/parts/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert(`Error deleting product: ${readApiError(err)}`);
    }
  };
 
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      (p.categoryName || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  }, [products, search]);
 
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
          placeholder="Search by name, SKU, category, or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>
 
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td title={p.description}>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.categoryName || "-"}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.quantityInStock}</td>
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
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">No products found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
 
        <Card.Footer className="bg-white">
          <Pagination className="mb-0">
            <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
            <Pagination.Last disabled={page === totalPages} onClick={() => setPage(totalPages)} />
          </Pagination>
        </Card.Footer>
      </Card>
 
      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
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
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                defaultValue={editingProduct?.description || ""}
                placeholder="Optional"
              />
            </Form.Group>
 
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select name="categoryId" defaultValue={editingProduct?.categoryId ?? ""} required>
                <option value="" disabled>Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
 
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" step="0.01" name="price" defaultValue={editingProduct?.price ?? ""} required />
            </Form.Group>
 
            <Form.Group>
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" name="stock" defaultValue={editingProduct?.quantityInStock ?? ""} required />
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
