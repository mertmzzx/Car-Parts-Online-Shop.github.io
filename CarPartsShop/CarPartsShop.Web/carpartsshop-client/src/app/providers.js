import { CartProvider } from "../context/CartContext";
// later we’ll also add AuthProvider

export default function Providers({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
