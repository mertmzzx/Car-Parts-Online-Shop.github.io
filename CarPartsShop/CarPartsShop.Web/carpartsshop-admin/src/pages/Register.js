// src/pages/Register.js
import { useState } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const normalizeError = (err) => {
    // Try to extract a helpful message from typical ASP.NET Core responses
    const r = err?.response;
    if (!r) return err?.message || "Network error";

    if (typeof r.data === "string") return r.data;

    if (r.data?.errors) {
      // ModelState-style: { errors: { Field: ["msg", ...], ... } }
      const firstKey = Object.keys(r.data.errors)[0];
      const firstMsg = r.data.errors[firstKey]?.[0];
      if (firstMsg) return firstMsg;
    }
    if (r.data?.title) return r.data.title;
    if (r.data?.detail) return r.data.detail;

    try {
      return JSON.stringify(r.data);
    } catch {
      return `HTTP ${r.status}`;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      // Backend expects: { firstName, lastName, email, password, confirmPassword }
      await http.post("/api/auth/register", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      // Success: send users to login
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(normalizeError(err) || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: 420 }}>
        <Card.Body>
          <Card.Title className="mb-3">Create account</Card.Title>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="firstName">
              <Form.Label>First name</Form.Label>
              <Form.Control
                name="firstName"
                value={form.firstName}
                onChange={onChange}
                autoFocus
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                name="lastName"
                value={form.lastName}
                onChange={onChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                required
                isInvalid={!!form.confirmPassword && form.password !== form.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                Passwords do not match.
              </Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting ? <Spinner size="sm" animation="border" /> : "Register"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
