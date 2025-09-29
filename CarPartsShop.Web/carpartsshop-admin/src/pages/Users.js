import { Table, Button, Form, InputGroup, Pagination, Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import http from "../api/http";
import { useAuth } from "../auth/AuthContext";
import RoleBadge from "../components/RoleBadge.js";
 
const roleOptions = ["SalesAssistant", "Customer"];
 
export default function Users() {
  const [users, setUsers] = useState([]);
  const { user: authUser } = useAuth();
  const currentEmail = (authUser?.email || "").toLowerCase();
 
  // --- Search (debounced) ---
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);
 
  // --- Pagination state ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
 
  function readApiError(err) {
    const r = err?.response;
    if (!r) return err?.message || "Network error";
    if (typeof r.data === "string") return r.data;
    if (r.data?.message) return r.data.message;
    if (r.data?.title) return r.data.title;
    try { return JSON.stringify(r.data); } catch { return `HTTP ${r.status}`; }
  }
 
  // Load users
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/api/admin/users", {
          params: { page, pageSize, search: debouncedSearch || undefined },
        });
 
        const items = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        const mapped = items.map((u) => {
          const roles = u.roles || [];
          const role = roles.includes("Administrator")
            ? "Admin"
            : roles.includes("SalesAssistant")
            ? "SalesAssistant"
            : "Customer";
          return {
            id: u.id,
            name:
              u.firstName || u.lastName
                ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                : u.email ?? "",
            email: u.email ?? "",
            role,
            isBlocked: !!u.lockedOut,
          };
        });
        setUsers(mapped);
 
        const headerTotal = res.headers["x-total-count"];
        setTotal(
          headerTotal ? Number(headerTotal) : Number(res.data?.total ?? mapped.length)
        );
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    })();
  }, [debouncedSearch, page, pageSize]);
 
  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      await http.patch(`/api/admin/users/${id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, role: newRole } : u)));
      alert("Role updated. The user must log out and log back in to receive the new permissions.");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) alert(err.response?.data || "Invalid role.");
      else if (status === 403) alert("You are not allowed to change this user's role.");
      else if (status === 404) alert("User not found.");
      else alert("Failed to change role.");
    }
  };
 
  const toggleBlock = async (id) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    const nextLocked = !u.isBlocked;
    try {
      await http.patch(`/api/admin/users/${id}/lock`, { locked: nextLocked });
      setUsers((prev) => prev.map((row) => (row.id === id ? { ...row, isBlocked: nextLocked } : row)));
    } catch (err) {
      alert(`Failed to ${nextLocked ? "block" : "unblock"} user: ${readApiError(err)}`);
      console.error("toggleBlock failed:", err);
    }
  };
 
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await http.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        alert(err?.response?.data?.detail || "User has orders and cannot be deleted.");
      } else {
        alert(`Failed to delete user: ${readApiError(err)}`);
      }
      console.error("deleteUser failed:", err);
    }
  };
 
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);
 
  return (
    <>
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <h2 className="mb-0">User Management</h2>
        <div className="d-flex align-items-end gap-2">
          <InputGroup style={{ maxWidth: 360 }}>
            <Form.Control
              placeholder="Search by ID, email, or name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <Button variant="outline-secondary" onClick={() => { setSearch(""); setPage(1); }}>
                Clear
              </Button>
            )}
          </InputGroup>
          <Form.Select
            size="sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ width: 110 }}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}/page</option>
            ))}
          </Form.Select>
        </div>
      </div>
 
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: 120 }}>ID</th>
                <th style={{ minWidth: 160 }}>Name</th>
                <th style={{ minWidth: 200 }}>Email</th>
                <th style={{ minWidth: 140 }}>Role</th>
                <th style={{ minWidth: 100 }}>Status</th>
                <th style={{ minWidth: 180 }}>Actions</th>
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
                      {u.role === "Admin" || isSelf ? (
                        <RoleBadge role={u.role === "Admin" ? "Administrator" : u.role} />
                      ) : (
                        <Form.Select
                          size="sm"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </Form.Select>
                      )}
                    </td>
                    <td>{u.isBlocked ? "Blocked" : "Active"}</td>
                    <td>
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
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">No users found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
 
        <Card.Footer className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {firstItem}-{lastItem} of {total}
            </small>
            <Pagination className="mb-0">
              <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
              <Pagination.Prev disabled={page === 1} onClick={goPrev} />
              <Pagination.Item active>{page}</Pagination.Item>
              <Pagination.Next disabled={page === totalPages} onClick={goNext} />
              <Pagination.Last disabled={page === totalPages} onClick={() => setPage(totalPages)} />
            </Pagination>
          </div>
        </Card.Footer>
      </Card>
    </>
  );
}