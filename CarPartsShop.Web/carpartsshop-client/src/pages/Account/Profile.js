import { useEffect, useState } from "react";
import { Button, Form, Row, Col, Alert, Spinner, Card } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { getMe, updateProfile as apiUpdateProfile, changePassword } from "../../services/userService";

export default function Profile() {
  const { user, updateUser, token } = useAuth(); // get token
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Profile form
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  // Change password form
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    let ignore = false;

    // wait until the token is mounted by AuthContext
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErr("");
      setOkMsg("");
      try {
        const me = await getMe(); // Authorization header is attached by axios
        if (!ignore) {
          setFirstName(me.firstName ?? "");
          setLastName(me.lastName ?? "");
          setEmail(me.email ?? user?.email ?? "");
        }
      } catch (e) {
        if (!ignore) setErr("Failed to load profile.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [token, user?.email]); // run when token becomes available

  async function onSaveProfile(e) {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    setSavingProfile(true);
    try {
      await apiUpdateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setOkMsg("Profile updated.");
    } catch (e) {
      setErr(e?.response?.data || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    setChangingPwd(true);
    try {
      if (newPwd !== newPwd2) {
        setErr("New passwords do not match.");
      } else {
        await changePassword({ currentPassword: curPwd, newPassword: newPwd });
        setCurPwd("");
        setNewPwd("");
        setNewPwd2("");
        setOkMsg("Password changed.");
      }
    } catch (e) {
      setErr(e?.response?.data || "Failed to change password.");
    } finally {
      setChangingPwd(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="vstack gap-4">
      <div>
        <h2 className="h5 mb-3">Profile</h2>
        {err && <Alert variant="danger" className="py-2">{err}</Alert>}
        {okMsg && <Alert variant="success" className="py-2">{okMsg}</Alert>}

        <Form onSubmit={onSaveProfile}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="pfFirst">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="pfLast">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group controlId="pfEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={email} readOnly />
                <Form.Text className="text-muted">
                  Email changes are not supported here.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Form>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h3 className="h6 mb-3">Change password</h3>
          <Form onSubmit={onChangePassword}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="pwdCur">
                  <Form.Label>Current password</Form.Label>
                  <Form.Control
                    type="password"
                    value={curPwd}
                    onChange={(e) => setCurPwd(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6} />
              <Col md={6}>
                <Form.Group controlId="pwdNew1">
                  <Form.Label>New password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="pwdNew2">
                  <Form.Label>Confirm new password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPwd2}
                    onChange={(e) => setNewPwd2(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              <Button variant="outline-primary" type="submit" disabled={changingPwd}>
                {changingPwd ? "Updating..." : "Update password"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
