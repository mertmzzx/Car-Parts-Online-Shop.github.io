import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setOk(false); setErr(""); setSending(true);
    try {
      // later add a backend endpoint, POST here:
      // await api.post("/api/contact", form);
      await new Promise((r) => setTimeout(r, 700)); // mock
      setOk(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErr("Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <h1 className="display-6 fw-bold mb-2">Contact us</h1>
              <p className="lead text-white-50 mb-0">
                Need help with fitment, delivery, or returns? Send us a message — expect a reply soon!
              </p>
            </Col>
            <Col lg={5}>
              <Card className="border-0 shadow-lg bg-white bg-opacity-10">
                <Card.Body className="text-white-50 small">
                  <div className="fw-semibold text-white mb-1">Support hours</div>
                  Mon–Fri 09:00–18:00 (EET)<br />
                  <div className="mt-3 fw-semibold text-white mb-1">Email</div>
                  support@silverstartparts.com<br />
                  <div className="mt-3 fw-semibold text-white mb-1">Phone</div>
                  +359 7777
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Form + Info */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            <Col lg={7}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h2 className="h5 mb-3">Send a message</h2>
                  {ok && <Alert variant="success" className="py-2">Thanks! We’ll get back to you shortly.</Alert>}
                  {err && <Alert variant="danger" className="py-2">{err}</Alert>}
                  <Form onSubmit={onSubmit} noValidate>
                    <Row className="g-3">
                      <Col sm={6}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          name="name"
                          value={form.name}
                          onChange={onChange}
                          required
                          placeholder="Your name"
                        />
                      </Col>
                      <Col sm={6}>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={onChange}
                          required
                          placeholder="you@example.com"
                        />
                      </Col>
                      <Col xs={12}>
                        <Form.Label>Subject</Form.Label>
                        <Form.Control
                          name="subject"
                          value={form.subject}
                          onChange={onChange}
                          placeholder="What can we help with?"
                        />
                      </Col>
                      <Col xs={12}>
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="message"
                          value={form.message}
                          onChange={onChange}
                          required
                          placeholder="Write your message…"
                        />
                      </Col>
                      <Col xs={12} className="d-grid d-sm-flex gap-2">
                        <Button type="submit" disabled={sending}>
                          {sending ? "Sending…" : "Send message"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() => setForm({ name: "", email: "", subject: "", message: "" })}
                          disabled={sending}
                        >
                          Clear
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h2 className="h5 mb-3">Our location</h2>
                  <div className="ratio ratio-16x9 rounded-3 overflow-hidden bg-light mb-3">
                    <iframe
                      title="Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4934.821789882864!2d23.354629086566785!3d42.65579046861966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa842791548ce7%3A0x5c3a3691d990d279!2sTechnical%20University!5e0!3m2!1sen!2sbg!4v1759087844551!5m2!1sen!2sbg" 
                      allowFullScreen
                    />
                  </div>
                  <div className="small text-muted">
                    Sofia City, Bulgaria<br />
                    Technical University of Sofia<br />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}
