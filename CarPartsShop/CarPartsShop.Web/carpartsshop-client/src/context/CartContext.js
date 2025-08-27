import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
const noopCart = Object.freeze({
  items: [], add: () => {}, remove: () => {}, setQty: () => {}, clear: () => {}, total: 0
});
export const useCart = () => useContext(CartCtx) ?? noopCart;

const LS_KEY = "cps_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(items)); }, [items]);

  const add = (product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(p => p.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty }];
    });
  };

  const remove = id => setItems(prev => prev.filter(p => p.id !== id));
  const setQty = (id, qty) => setItems(prev => prev.map(p => p.id === id ? { ...p, qty } : p));
  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const value = useMemo(() => ({ items, add, remove, setQty, clear, total }), [items, total]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
