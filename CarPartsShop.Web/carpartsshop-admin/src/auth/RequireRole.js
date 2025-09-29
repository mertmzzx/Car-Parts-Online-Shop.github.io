import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Modal, Button } from "react-bootstrap";

export default function RequireRole({ allowed, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showDenied, setShowDenied] = useState(false);

  const isLoggedIn = !!user;
  const hasRole = !!user?.roles?.some((r) => allowed.includes(r));

  // Handle access denial
  useEffect(() => {
    if (isLoggedIn && !hasRole) {
      // Show modal popup
      setShowDenied(true);

      // Auto logout + redirect after a short delay
      const timer = setTimeout(() => {
        logout();
        navigate("/login", {
          replace: true,
          state: { from: location.pathname },
        });
      }, 2500); // 2.5 seconds to see the popup

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, hasRole]);

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRole) {
    return (
      <Modal show={showDenied} backdrop="static" centered>
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>🚫 Access Denied</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You do not have permission to access this page.  
          You’ll be redirected to the login screen shortly.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => {
              setShowDenied(false);
              logout();
              navigate("/login", { replace: true });
            }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return children;
}
