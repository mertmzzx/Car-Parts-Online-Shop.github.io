import { Table, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import http from "../api/http";
import { useAuth } from "../auth/AuthContext";

const roleOptions = ["SalesAssistant", "Customer"];

export default function Users() {
  const [users, setUsers] = useState([]);
  const { user: authUser } = useAuth();
  const currentEmail = (authUser?.email || "").toLowerCase();

  // Load users once
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/api/admin/users", { params: { page: 1, pageSize: 50 } });
        const items = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        const mapped = items.map((u) => {
          const roles = u.roles || [];
          const role =
            roles.includes("Administrator")
              ? "Admin"
              : roles.includes("SalesAssistant")
              ? "SalesAssistant"
              : "Customer";
          return {
            id: u.id, // string is fine for React keys
            name:
              (u.firstName || u.lastName)
                ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                : (u.email ?? ""),
            email: u.email ?? "",
            role,
            isBlocked: !!u.lockedOut,
          };
        });
        setUsers(mapped);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    })();
  }, []);

  const handleRoleChange = (id, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  const toggleBlock = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isBlocked: !u.isBlocked } : u))
    );
  };

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <>
      <h2>User Management</h2>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = (u.email || "").toLowerCase() === currentEmail;
            return (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {/* Admin rows (and your own row) are not editable here */}
                  {u.role === "Admin" || isSelf ? (
                    <strong>{u.role === "Admin" ? "Admin" : u.role}</strong>
                  ) : (
                    <Form.Select
                      size="sm"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </td>
                <td>{u.isBlocked ? "Blocked" : "Active"}</td>
                <td>
                  {/* Hide all actions for your own row */}
                  {!isSelf && (
                    <>
                      <Button
                        size="sm"
                        variant={u.isBlocked ? "success" : "warning"}
                        onClick={() => toggleBlock(u.id)}
                        className="me-2"
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteUser(u.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
