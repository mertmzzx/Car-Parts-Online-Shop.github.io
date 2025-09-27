import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card} from "react-bootstrap";
import api from "../../services/http";

export default function Home() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Keep this simple & compatible with your existing /api/Parts
        const { data } = await api.get("/api/Parts", {
          params: { page: 1, pageSize: 8 }, // default sort from your API
        });
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        if (alive) setFeatured(list);
      } catch (e) {
        if (alive) setErr("Could not load featured products.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const features = useMemo(() => ([
    { title: "Quality OEM & Aftermarket", text: "Carefully curated parts with clear fitment details." },
    { title: "Fast Shipping", text: "Same-day dispatch on most orders placed before 15:00." },
    { title: "Secure Checkout", text: "Your data is protected with best-practice security." },
    { title: "Helpful Support", text: "Real people, real answers—before and after your purchase." },
  ]), []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="py-5 bg-dark text-white position-relative overflow-hidden">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <h1 className="display-5 fw-bold mb-3">
                Find the right part.<br />First time, every time.
              </h1>
              <p className="lead text-white-50 mb-4">
                Search thousands of car parts with live stock and fair prices. No guesswork—just perfect fit.
              </p>
              <div className="d-flex gap-2">
                <Button size="lg" variant="primary" onClick={() => nav("/products")}>
                  Browse Products
                </Button>
                <Button size="lg" variant="outline-light" onClick={() => nav("/cart")}>
                  View Cart
                </Button>
              </div>
            </Col>
            <Col lg={5}>
              <div className="rounded-4 shadow-lg overflow-hidden" style={{ background: "linear-gradient(135deg,#0d6efd22,#ffffff11)" }}>
                <div className="p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-primary bg-opacity-25 rounded-circle p-3">
                      <span role="img" aria-label="engine" className="fs-3">🔧</span>
                    </div>
                    <div>
                      <div className="fw-semibold">Quick search</div>
                      <div className="text-white-50 small">Filter by category, price, brand, vehicle</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-primary bg-opacity-25 rounded-circle p-3">
                      <span role="img" aria-label="shipping" className="fs-3">🚚</span>
                    </div>
                    <div>
                      <div className="fw-semibold">Fast delivery</div>
                      <div className="text-white-50 small">Reliable couriers across the EU</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-25 rounded-circle p-3">
                      <span role="img" aria-label="shield" className="fs-3">🛡️</span>
                    </div>
                    <div>
                      <div className="fw-semibold">Easy returns</div>
                      <div className="text-white-50 small">Hassle-free within 14 days</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Highlights */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            {features.map((f, i) => (
              <Col key={i} md={6} lg={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="mb-2">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {i + 1}
                      </span>
                    </div>
                    <div className="fw-semibold mb-1">{f.title}</div>
                    <div className="text-muted small">{f.text}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Categories */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">Popular categories</h2>
            <Link to="/products" className="btn btn-sm btn-outline-primary">Explore all</Link>
          </div>

          <div className="row g-3 flex-nowrap overflow-auto scroll-x pe-1">
            {[
              { key: "brakes", label: "Brakes & Rotors", emoji: "🛑", accent: "var(--bs-danger)" },
              { key: "filters", label: "Filters", emoji: "🧰", accent: "var(--bs-warning)" },
              { key: "suspension", label: "Suspension", emoji: "🔩", accent: "var(--bs-success)" },
              { key: "lighting", label: "Lighting", emoji: "💡", accent: "var(--bs-info)" },
              { key: "engine", label: "Engine Parts", emoji: "⚙️", accent: "var(--bs-primary)" },
              { key: "interior", label: "Interior", emoji: "🪑", accent: "var(--bs-secondary)" },
            ].map((c) => (
              <div key={c.key} className="col-6 col-md-4 col-lg-2">
                <Link
                  to={`/products?category=${encodeURIComponent(c.key)}`}
                  className="text-decoration-none"
                >
                  <div className="cat-tile shadow-sm tile-hover rounded-4 p-3 bg-white h-100">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                      style={{
                        height: 64,
                        width: 64,
                        background:
                          `linear-gradient(135deg, ${c.accent}22 0%, ${c.accent}11 100%)`,
                        border: `1px solid ${c.accent}33`,
                      }}
                    >
                      <span className="fs-3" role="img" aria-label={c.label}>{c.emoji}</span>
                    </div>
                    <div className="fw-semibold small text-dark text-truncate-2">{c.label}</div>
                    <div className="small text-muted mt-1">Shop now →</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">Featured parts</h2>
            <Link to="/products" className="btn btn-sm btn-outline-primary">Browse catalog</Link>
          </div>

          {err && <div className="alert alert-warning">{err}</div>}

          <div className="row g-3">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="col-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="ratio ratio-4x3 bg-light placeholder" />
                    <div className="card-body">
                      <div className="placeholder-glow">
                        <span className="placeholder col-8 mb-2"></span>
                        <span className="placeholder col-6"></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              : featured.slice(0, 8).map((p) => {
                const id = p.id ?? p.Id;
                const name = p.name ?? p.Name ?? "Part";
                const sku = p.sku ?? p.Sku ?? "";
                const price = Number(p.price ?? p.Price ?? 0);
                const imageUrl = p.imageUrl ?? p.ImageUrl;

                return (
                  <div key={id} className="col-6 col-md-4 col-lg-3">
                    <div className="card h-100 shadow-sm border-0 tile-hover">
                      <Link to={`/products/${id}`} className="text-decoration-none text-reset">
                        <div className="position-relative img-zoom rounded-top overflow-hidden">
                          <div className="ratio ratio-4x3 bg-light">
                            {imageUrl ? (
                              <img src={imageUrl} alt={name} className="object-fit-cover" />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center text-muted">
                                <span className="fw-semibold small">No image</span>
                              </div>
                            )}
                          </div>
                          <span className="price-chip badge bg-dark-subtle text-dark-emphasis position-absolute end-0 bottom-0 m-2">
                            €{price.toFixed(2)}
                          </span>
                        </div>
                        <div className="card-body">
                          <div className="fw-semibold text-truncate" title={name}>{name}</div>
                          <div className="text-muted small text-truncate">{sku}</div>
                        </div>
                      </Link>
                      <div className="card-footer bg-white border-0 pt-0">
                        <Link to={`/products/${id}`} className="btn btn-outline-primary w-100">
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>


      {/* Bottom CTA */}
      <section className="py-5 bg-primary text-white">
        <Container className="text-center">
          <h3 className="h4 fw-semibold mb-2">Need help finding a part?</h3>
          <p className="text-white-50 mb-3">Search the catalog or contact support—our team is happy to help.</p>
          <div className="d-flex gap-2 justify-content-center">
            <Link to="/products" className="btn btn-light">Start shopping</Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
