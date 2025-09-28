import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
const noopCart = Object.freeze({
  items: [],
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
  clearCart: () => {}, // alias so consumers don't crash
  total: 0,
  count: 0,
});
export const useCart = () => useContext(CartCtx) ?? noopCart;

const LS_KEY = "cps_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            qty: Math.max(1, Number(p.qty) || 1),
            imageUrl: p.imageUrl ?? null,
            sku: p.sku ?? null,
            categoryName: p.categoryName ?? null,
          }))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    const inc = Math.max(1, Number(qty) || 1);
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        const current = copy[i];
        const nextQty = Math.min(99, (Number(current.qty) || 0) + inc);
        copy[i] = { ...current, qty: nextQty };
        return copy;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          qty: Math.min(99, inc),
          imageUrl: product.imageUrl ?? null,
          sku: product.sku ?? null,
          categoryName: product.categoryName ?? null,
        },
      ];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => (p.id === id ? false : true)));

  const setQty = (id, qty) =>
    setItems((prev) =>
      prev
        .map((p) => {
          if (p.id !== id) return p;
          const q = Number(qty);
          if (!Number.isFinite(q) || q <= 0) return { ...p, qty: 0 }; // will be filtered out
          return { ...p, qty: Math.max(1, Math.min(99, q)) };
        })
        .filter((p) => p.qty > 0)
    );

  const clear = () => setItems([]);         // existing
  const clearCart = () => setItems([]);     // alias used by Checkout

  const total = useMemo(
    () => items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0),
    [items]
  );

  const count = useMemo(() => items.reduce((s, i) => s + (Number(i.qty) || 0), 0), [items]);

  const value = useMemo(
    () => ({ items, add, remove, setQty, clear, clearCart, total, count }), // expose clearCart
    [items, total, count]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
