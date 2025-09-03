import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="bg-light py-3 mt-auto border-top">
      <Container fluid className="px-3 px-md-4 d-flex justify-content-between align-items-center">
        <small className="text-muted">© {new Date().getFullYear()} Car Parts Shop</small>
        <nav>
          <a href="/privacy" className="text-muted me-3">Privacy</a>
          <a href="/terms" className="text-muted">Terms</a>
        </nav>
      </Container>
    </footer>
  );
}
