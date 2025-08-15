import { Table, Button, Form } from "react-bootstrap";
import { useState } from "react";

// Simulate logged-in user (Admin)
const loggedInUserId = 1;

const initialUsers = [
  { id: 1, name: "You (Admin)", email: "admin@example.com", role: "Admin", isBlocked: false },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "SalesAssistant", isBlocked: false },
  { id: 3, name: "Bob Marley", email: "bob@example.com", role: "Customer", isBlocked: false },
  { id: 4, name: "Alice Johnson", email: "alice@example.com", role: "Customer", isBlocked: true },
];

const roleOptions = ["SalesAssistant", "Customer"];

export default function Users() {
  const [users, setUsers] = useState(initialUsers);

  const handleRoleChange = (id, newRole) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: newRole } : u
      )
    );
  };

  const toggleBlock = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isBlocked: !u.isBlocked } : u
      )
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
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                {u.role === "Admin" ? (
                  <strong>Admin</strong>
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
                {u.id !== loggedInUserId && (
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
          ))}
        </tbody>
      </Table>
    </>
  );
}
