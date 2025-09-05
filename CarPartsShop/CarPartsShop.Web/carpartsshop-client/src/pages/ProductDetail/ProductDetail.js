// src/pages/ProductDetail/ProductDetail.js
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Spinner,
  Badge,
  Breadcrumb,
  InputGroup,
  Form,
} from "react-bootstrap";
import { getProductById, getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard";
import { flyToCart } from "../../utils/flyToCart"; 

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [related, setRelated] = useState([]);

  const imgRef = useRef(null); 

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProductById(id);
        if (ignore) return;

        setP(data);
        setQty(1);

        // fetch related by category (exclude the current product)
        if (data?.categoryId) {
          try {
            const rel = await getProducts({
              page: 1,
              size: 8,
              categoryId: data.categoryId,
              sort: "newest",
            });
            if (!ignore) {
              setRelated((rel.items || []).filter((it) => it.id !== data.id));
            }
          } catch {
            // related fetch failure shouldn't block the page
            if (!ignore) setRelated([]);
          }
        } else {
          setRelated([]);
        }
      } catch (e) {
        console.error(
          "Product detail error:",
          e?.response?.status,
          e?.response?.data || e?.message
        );
        if (!ignore) setError("Failed to load product.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (p?.name) document.title = `${p.name} • CarPartsShop`;
  }, [p?.name]);

  const imageUrl = useMemo(
    () => p?.imageUrl || "https://placehold.co/800x600?text=Part",
    [p?.imageUrl]
  );

  const inStock = (p?.quantityInStock ?? 0) > 0;
  const maxQty = Math.max(0, Math.min(99, p?.quantityInStock ?? 0));

  function addToCart() {
    if (!p) return;
    add(p, qty);

    if (imgRef.current) {
      flyToCart(imageUrl, imgRef.current);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) return <div className="alert alert-danger my-3">{error}</div>;
  if (!p) return null;

  return (
    <div className="container-fluid px-4 py-3">
      <div className="product-detail-page">
        {/* Breadcrumb + back */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <Breadcrumb className="product-breadcrumb mb-0">
            <Breadcrumb.Item as={Link} to="/products">
              Products
            </Breadcrumb.Item>
            {p.categoryName && (
              <Breadcrumb.Item
                as={Link}
                to={`/products?category=${p.categoryId}`}
              >
                {p.categoryName}
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item active>{p.name}</Breadcrumb.Item>
          </Breadcrumb>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <Row className="g-4 align-items-start">
          {/* Image */}
          <Col md={5} lg={4}>
            <div className="pd-image-wrapper small">
              <img
                ref={imgRef}   
                src={imageUrl}
                alt={p.name}
                className="pd-image"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x450?text=Part";
                }}
              />
            </div>
          </Col>

          {/* Info */}
          <Col md={7} lg={8}>
            <h1 className="h3 mb-1">{p.name}</h1>
            <div className="text-muted mb-2">SKU: {p.sku || "-"}</div>

            <div className="d-flex align-items-center gap-2 mb-3">
              {p.categoryName && (
                <Badge bg="light" text="dark" className="border">
                  {p.categoryName}
                </Badge>
              )}
              {inStock ? (
                <Badge bg="success">In stock</Badge>
              ) : (
                <Badge bg="secondary">Out of stock</Badge>
              )}
            </div>

            <div className="h4 mb-3">${Number(p.price).toFixed(2)}</div>

            <div className="mb-4 text-body">
              {p.description || "No description available."}
            </div>

            <div className="d-flex align-items-end gap-3">
              <InputGroup style={{ maxWidth: 160 }}>
                <InputGroup.Text>Quantity</InputGroup.Text>
                <Form.Control
                  type="number"
                  min={inStock ? 1 : 0}
                  max={maxQty}
                  value={qty}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isNaN(v)) return;
                    const clamped = Math.min(
                      Math.max(v, inStock ? 1 : 0),
                      maxQty || 0
                    );
                    setQty(clamped);
                  }}
                  disabled={!inStock}
                />
              </InputGroup>

              <Button onClick={addToCart} disabled={!inStock}>
                {inStock ? "Add to Cart" : "Unavailable"}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-3">Related Products</h4>
            <Row xs={1} sm={2} md={3} lg={4} className="g-3">
              {related.slice(0, 4).map((rp) => (
                <Col key={rp.id}>
                  <ProductCard product={rp} onAdd={add} />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
}
