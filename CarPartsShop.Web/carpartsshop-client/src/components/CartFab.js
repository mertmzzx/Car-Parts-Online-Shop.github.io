import { Link, useLocation } from "react-router-dom";
import { BsCart3 } from "react-icons/bs";
import { useCart } from "../context/CartContext";

export default function CartFab() {
  const { items } = useCart();
  const count = items.length;
  const location = useLocation();

  // Hide cart on these pages
  const hideCart = ["/login", "/register"].includes(location.pathname);

  if (hideCart) return null; // don't render anything


  return (
    <Link to="/cart" className="cart-fab" aria-label="Cart">
      <BsCart3 size={28} />
      {count > 0 && <span className="cart-fab-badge">{count}</span>}
    </Link>
  );
}
