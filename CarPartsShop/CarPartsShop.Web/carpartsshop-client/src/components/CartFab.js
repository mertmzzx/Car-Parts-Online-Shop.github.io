import { Link } from "react-router-dom";
import { BsCart3 } from "react-icons/bs";
import { useCart } from "../context/CartContext";

export default function CartFab() {
  const { items } = useCart();
  const count = items.length;

  return (
    <Link to="/cart" className="cart-fab" aria-label="Cart">
      <BsCart3 size={28} />
      {count > 0 && <span className="cart-fab-badge">{count}</span>}
    </Link>
  );
}
