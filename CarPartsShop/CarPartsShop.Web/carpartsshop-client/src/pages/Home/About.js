import { Container, Row, Col, Card, Badge } from "react-bootstrap";

export default function About() {
  const values = [
    { emoji: "🧰", title: "Expertise", text: "We know parts, fitment, and suppliers. No guesswork." },
    { emoji: "🤝", title: "Trust", text: "Clear pricing, honest stock, straightforward returns." },
    { emoji: "⚡", title: "Speed", text: "Fast picking, fast shipping, fast replies." },
    { emoji: "❤️", title: "Care", text: "We treat your car like it’s ours." },
  ];

  const stats = [
    { number: "12k+", label: "Parts in catalog" },
    { number: "4.9★", label: "Customer rating" },
    { number: "24h", label: "Avg. response time" },
    { number: "28+", label: "Brands stocked" },
  ];

  const team = [
    { name: "Mert", role: "Founder / CTO" },
    { name: "N. Stoyanov", role: "Operations" },
    { name: "I. Petrov", role: "Support Lead" },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <h1 className="display-6 fw-bold mb-3">About CarPartsShop</h1>
              <p className="lead text-white-50 mb-0">
                We’re a small team obsessed with making car-part shopping fast, accurate, and fair.
                From the first search to the final bolt, we’ve got your back.
              </p>
            </Col>
            <Col lg={5}>
              <Card className="border-0 shadow-lg bg-white bg-opacity-10">
                <Card.Body>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <Badge bg="primary">Mission</Badge>
                    <div className="text-white-50 fw-semibold">Right part, first time.</div>
                  </div>
                  <div className="text-white-50 small">
                    Our mission is to remove friction—clear fitment, clear stock, clear support.
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Values */}
      <section className="py-5">
        <Container>
          <h2 className="h4 mb-3">What we stand for</h2>
          <Row className="g-3">
            {values.map((v, i) => (
              <Col key={i} md={6} lg={3}>
                <Card className="h-100 border-0 shadow-sm tile-hover">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                        <span className="fs-4" role="img" aria-label={v.title}>{v.emoji}</span>
                      </div>
                      <div className="fw-semibold">{v.title}</div>
                    </div>
                    <div className="text-muted small">{v.text}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="g-3 text-center">
            {stats.map((s, i) => (
              <Col key={i} xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="display-6 fw-bold">{s.number}</div>
                    <div className="text-muted">{s.label}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Team */}
      <section className="py-5">
        <Container>
          <h2 className="h4 mb-3">Our Team</h2>
          <Row className="g-3">
            {team.map((m, i) => (
              <Col key={i} sm={6} lg={4}>
                <Card className="border-0 shadow-sm h-100 tile-hover">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light" style={{ width: 56, height: 56 }} />
                    <div>
                      <div className="fw-semibold">{m.name}</div>
                      <div className="text-muted small">{m.role}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
}
