// src/components/Footer.js
import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="footer-glass mt-auto">
      <Container fluid className="px-3 px-md-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <small className="text-muted">
          © {new Date().getFullYear()} <span className="fw-semibold">CarPartsShop</span>
        </small>
        <nav className="d-flex gap-3">
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
        </nav>
      </Container>
    </footer>
  );
}
