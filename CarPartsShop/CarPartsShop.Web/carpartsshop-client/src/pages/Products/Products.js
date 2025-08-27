import { useEffect, useState } from "react";
import { Row, Col, Form, InputGroup, Button, Pagination, Spinner } from "react-bootstrap";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";

export default function Products() {
  const { add } = useCart();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(12);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const data = await getProducts({ page, size, search });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      console.error("Products load error:", e?.response?.status, e?.response?.data || e?.message);
      setError(`Failed to load products${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  function handleSubmit(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div>
      <h1 className="h3 mb-3">Catalog</h1>

      <Form onSubmit={handleSubmit} className="mb-3">
        <InputGroup>
          <Form.Control
            placeholder="Search by name, SKU, or OEM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </InputGroup>
      </Form>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-muted">No products found.</div>
      )}

      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {items.map((p) => (
          <Col key={p.id}>
            <ProductCard product={p} onAdd={add} />
          </Col>
        ))}
      </Row>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
            <Pagination.Prev onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
          </Pagination>
        </div>
      )}
    </div>
  );
}
