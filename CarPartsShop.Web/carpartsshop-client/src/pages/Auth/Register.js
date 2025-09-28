import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      // API assigns role = Customer by default 
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate("/account", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.title ||
        err?.response?.data ||
        err?.message ||
        "Registration failed.";
      setError(typeof msg === "string" ? msg : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container fluid className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="mb-4">
                <h1 className="h3 mb-1">Create your account</h1>
                <div className="text-muted">
                  Sign up to shop and track your orders
                </div>
              </div>

              {error && (
                <Alert variant="danger" className="py-2">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="regFirstName">
                      <Form.Label>First name</Form.Label>
                      <Form.Control
                        name="firstName"
                        value={form.firstName}
                        onChange={onChange}
                        placeholder="John"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="regLastName">
                      <Form.Label>Last name</Form.Label>
                      <Form.Control
                        name="lastName"
                        value={form.lastName}
                        onChange={onChange}
                        placeholder="Doe"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group controlId="regEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="you@example.com"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group controlId="regPassword" className="mb-0">
                      <Form.Label>Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPwd ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={onChange}
                          placeholder="••••••••"
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPwd((s) => !s)}
                          tabIndex={-1}
                        >
                          {showPwd ? "Hide" : "Show"}
                        </Button>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        At least 8 characters, include a number.
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group controlId="regPassword2">
                      <Form.Label>Confirm password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPwd2 ? "text" : "password"}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={onChange}
                          placeholder="••••••••"
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPwd2((s) => !s)}
                          tabIndex={-1}
                        >
                          {showPwd2 ? "Hide" : "Show"}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col xs={12} className="pt-2">
                    <div className="d-grid gap-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Creating account…
                          </>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              <div className="mt-4 text-center text-muted">
                Already have an account? <Link to="/login">Sign in</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
