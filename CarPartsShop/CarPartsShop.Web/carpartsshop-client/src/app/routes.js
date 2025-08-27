import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import AccountOverview from "../pages/Account/AccountOverview";

export default function RoutesConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/account/overview" element={<AccountOverview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
