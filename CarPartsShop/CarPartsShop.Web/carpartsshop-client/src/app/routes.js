// src/app/routes.js
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import Products from "../pages/Products/Products";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

import AccountLayout from "../pages/Account/AccountLayout";
import AccountOverview from "../pages/Account/AccountOverview";
import Profile from "../pages/Account/Profile";
import Orders from "../pages/Account/Orders";
import OrderDetail from "../pages/Account/OrderDetail";
import Addresses from "../pages/Account/Addresses";

export default function RoutesConfig() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Products />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute roles={["Customer"]}>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Account pages (protected) */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AccountOverview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="addresses" element={<Addresses />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<h2 className="text-center mt-5">Page not found</h2>} />
    </Routes>
  );
}
