import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../../services/orderService";
import { getMyAddress } from "../../services/addressService"; // you already have this
import { useCart } from "../../context/CartContext";           // your existing cart context
import { useAuth } from "../../context/AuthContext";           // to ensure user is logged in

const emptyOverride = {
  firstName: "", lastName: "",
  addressLine1: "", addressLine2: "",
  city: "", state: "", postalCode: "", country: "BG",
  phone: ""
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart(); // expect items like {id/partId, quantity, price, name}
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savedAddress, setSavedAddress] = useState(null); // null → none saved
  const [useSaved, setUseSaved] = useState(true);
  const [override, setOverride] = useState(emptyOverride);
  const [shipping, setShipping] = useState("Standard");
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // ✅ NEW
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // redirect if cart empty or not logged
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true, state: { from: "/checkout" } });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const a = await getMyAddress();
        if (alive) {
          setSavedAddress(a);                      // a can be null (no saved address yet)
          setUseSaved(!!a);                        // default to saved if present
          if (!a) setUseSaved(false);              // force override form when none saved
        }
      } catch {
        if (alive) setSavedAddress(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const cartRows = useMemo(() => {
    // normalize to DTO shape expected by backend
    return (items || []).map(it => ({
      partId: it.partId ?? it.id,
      quantity: it.quantity
    }));
  }, [items]);

  const canPlace = useMemo(() => {
    if (!cartRows.length) return false;
    if (useSaved) return !!savedAddress;
    // minimal validation for override
    const { addressLine1, city, postalCode, country } = override;
    return !!addressLine1 && !!city && !!postalCode && !!country;
  }, [cartRows.length, useSaved, savedAddress, override]);

  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n || 0);

  const onChangeOverride = (e) => {
    const { name, value } = e.target;
    setOverride(o => ({ ...o, [name]: value }));
  };

  const place = async (e) => {
    e.preventDefault();
    if (!canPlace || placing) return;
    setPlacing(true); setError("");

    try {
      const res = await placeOrder({
        items: cartRows,
        useSavedAddress: useSaved,
        addressOverride: useSaved ? null : override,
        shippingMethod: shipping,
        paymentMethod, // ✅ NEW
      });
      clearCart();
      navigate("/account/orders", { replace: true, state: { placedOrderId: res?.id } });
    } catch (err) {
      const msg =
        err?.response?.data?.title ||
        err?.response?.data ||
        err?.message ||
        "Failed to place order.";
      setError(typeof msg === "string" ? msg : "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="container py-4">Loading checkout…</div>;
  if (!items?.length) return <div className="container py-4">Your cart is empty.</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Checkout</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={place} className="row g-4">
        {/* Left column: address + shipping */}
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header">Delivery Address</div>
            <div className="card-body">
              <div className="form-check mb-2">
                <input
                  id="useSaved"
                  className="form-check-input"
                  type="radio"
                  name="addrMode"
                  checked={useSaved}
                  onChange={() => setUseSaved(true)}
                  disabled={!savedAddress}
                />
                <label className="form-check-label" htmlFor="useSaved">
                  Use my saved address {(!savedAddress) && <span className="text-muted">(none saved)</span>}
                </label>
              </div>

              <div className="border rounded p-3 mb-3" style={{ background: "#fafafa" }}>
                {savedAddress ? (
                  <>
                    <div className="fw-semibold">{(override.firstName || "") && useSaved ? `${override.firstName} ${override.lastName}` : ""}</div>
                    <div>{savedAddress.addressLine1}</div>
                    {savedAddress.addressLine2 && <div>{savedAddress.addressLine2}</div>}
                    <div>
                      {[savedAddress.city, savedAddress.state].filter(Boolean).join(", ")} {savedAddress.postalCode}
                    </div>
                    <div>{savedAddress.country}</div>
                    {savedAddress.phone && <div className="text-muted small">Phone: {savedAddress.phone}</div>}
                  </>
                ) : (
                  <div className="text-muted">You don’t have a saved address yet. Enter one below or go to Account → Addresses to save it.</div>
                )}
              </div>

              <div className="form-check mb-3">
                <input
                  id="useTemp"
                  className="form-check-input"
                  type="radio"
                  name="addrMode"
                  checked={!useSaved}
                  onChange={() => setUseSaved(false)}
                />
                <label className="form-check-label" htmlFor="useTemp">
                  Enter a different address for this order
                </label>
              </div>

              {/* Temporary address form */}
              <fieldset disabled={useSaved} className="border rounded p-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First name</label>
                    <input className="form-control" name="firstName" value={override.firstName} onChange={onChangeOverride} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last name</label>
                    <input className="form-control" name="lastName" value={override.lastName} onChange={onChangeOverride} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address line 1</label>
                    <input className="form-control" name="addressLine1" value={override.addressLine1} onChange={onChangeOverride} required={!useSaved} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address line 2</label>
                    <input className="form-control" name="addressLine2" value={override.addressLine2} onChange={onChangeOverride} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input className="form-control" name="city" value={override.city} onChange={onChangeOverride} required={!useSaved} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State/Region</label>
                    <input className="form-control" name="state" value={override.state} onChange={onChangeOverride} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Postal code</label>
                    <input className="form-control" name="postalCode" value={override.postalCode} onChange={onChangeOverride} required={!useSaved} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country</label>
                    <input className="form-control" name="country" value={override.country} onChange={onChangeOverride} required={!useSaved} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input className="form-control" name="phone" value={override.phone} onChange={onChangeOverride} />
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Shipping</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="shipStandard"
                      name="shipping"
                      checked={shipping === "Standard"}
                      onChange={() => setShipping("Standard")}
                    />
                    <label className="form-check-label" htmlFor="shipStandard">
                      Standard (3–5 days)
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="shipExpress"
                      name="shipping"
                      checked={shipping === "Express"}
                      onChange={() => setShipping("Express")}
                    />
                    <label className="form-check-label" htmlFor="shipExpress">
                      Express (1–2 days)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Payment Method */}
          <div className="card mt-3">
            <div className="card-header">Payment Method</div>
            <div className="card-body">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="pmCash"
                  name="paymentMethod"
                  value="Cash"
                  checked={paymentMethod === "Cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="pmCash">
                  Cash on Delivery
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: order summary */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">Order Summary</div>
            <div className="card-body">
              <ul className="list-group list-group-flush mb-3">
                {(items || []).map((it) => {
                  const qty = it.quantity ?? it.qty ?? 1;
                  const price = it.price ?? it.unitPrice ?? 0;
                  return (
                    <li key={it.partId ?? it.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{it.name}</div>
                        <div className="text-muted small">Qty: {qty}</div>
                      </div>
                      <div className="text-end">{fmtMoney(price * qty)}</div>
                    </li>
                  );
                })}

              </ul>
              <div className="d-flex justify-content-between">
                <span>Items Total</span>
                <span className="fw-semibold">{fmtMoney(total || 0)}</span>
              </div>
            </div>
            <div className="card-footer text-center">
              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={!canPlace || placing}
              >
                {placing ? "Placing order…" : "Place Order"}
              </button>
              {!canPlace && (
                <div className="small text-muted mt-2">
                  {useSaved
                    ? "No saved address on file."
                    : "Please fill Address line 1, City, Postal code and Country."}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
