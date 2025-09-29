import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const roles = user.roles || [];
    if (roles.includes("Administrator") || roles.includes("SalesAssistant")) {
      navigate(from, { replace: true });      
    } else {
      navigate("/403", { replace: true });    
    }
  }, [user, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Debug: see exactly what we are sending
    console.log("[Login] submit →", { email });

    const res = await login(email, password);

    // Debug: see what came back from AuthContext
    console.log("[Login] result:", res);

    if (!res.ok) {
      setError(res.error || "Login failed.");
      return;
    }

    setTimeout(() => {
      const roles = res.user?.roles || [];
      if (roles.includes("Administrator") || roles.includes("SalesAssistant")) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/403", { replace: true });
      }
    }, 0);
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: 380 }}>
        <Card.Body>
          <Card.Title className="mb-3">Admin Login</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@shop.com"
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading} className="w-100">
              {loading ? <Spinner size="sm" animation="border" /> : "Sign in"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
