import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Button, Spinner } from "react-bootstrap";
import { getProductById } from "../../services/productService";
import { useCart } from "../../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const data = await getProductById(id);
        setP(data);
      } catch (e) {
        console.error("Product detail error:", e?.response?.status, e?.response?.data || e?.message);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!p) return null;

  return (
    <Row className="g-4">
      <Col md={6}>
        <img
          src={p.imageUrl || "https://via.placeholder.com/800x600?text=Part"}
          alt={p.name}
          className="img-fluid rounded"
        />
      </Col>
      <Col md={6}>
        <h1 className="h3">{p.name}</h1>
        <div className="mb-2 text-muted">SKU: {p.sku || "-"}</div>
        <div className="h4 mb-3">${Number(p.price).toFixed(2)}</div>
        <div className="mb-3">{p.description || "No description."}</div>
        <Button onClick={() => add(p, 1)}>Add to Cart</Button>
      </Col>
    </Row>
  );
}
