// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireRole from "./auth/RequireRole";

import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public: no layout here */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected: AdminLayout wraps everything below */}
          <Route
            path="/"
            element={
              <RequireRole allowed={["Administrator", "SalesAssistant"]}>
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route
              path="users"
              element={
                <RequireRole allowed={["Administrator"]}>
                  <Users />
                </RequireRole>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
