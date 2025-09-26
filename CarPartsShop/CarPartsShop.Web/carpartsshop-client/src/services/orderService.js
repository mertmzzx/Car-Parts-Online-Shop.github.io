// src/services/orderService.js
import api from "./http";

// Robust mapper: supports {id|partId} and {quantity|qty}, coerces to positive ints
function toOrderItems(items = []) {
  return items
    .map((i) => {
      const partId = i.partId ?? i.id;
      const rawQty = i.quantity ?? i.qty;
      const qtyNum = Number(rawQty);

      return {
        partId,
        quantity: Number.isFinite(qtyNum) && qtyNum > 0 ? qtyNum : 1, // fallback to 1 (never 0)
      };
    })
    .filter((x) => Number.isFinite(x.partId)); // discard any malformed entries
}

// items: [{ partId, quantity }]
// useSavedAddress: boolean
// addressOverride: { firstName,lastName,addressLine1,addressLine2,city,state,postalCode,country,phone }  (when not using saved)
// shippingMethod: "Standard" | "Express" (string)
export async function placeOrder({ items, useSavedAddress, addressOverride, shippingMethod, paymentMethod }) {
  const orderItems = toOrderItems(items);
  if (!orderItems.length) {
    throw new Error("Your cart is empty or invalid.");
  }

  const payload = {
    items: orderItems,
    useSavedAddress: !!useSavedAddress,
    shippingMethod: shippingMethod || "Standard",
    shippingAddressOverride: useSavedAddress ? null : addressOverride || null,
    paymentMethod: paymentMethod || "Cash",
  };

  const { data } = await api.post("/api/orders", payload);
  return data; // OrderResponseDto
}

/** Normalize an order coming from the API into a camelCased object */
function normalizeOrder(o) {
  if (!o) return null;
  return {
    id: o.Id ?? o.id,
    customerId: o.CustomerId ?? o.customerId,
    createdAt: o.CreatedAt ?? o.createdAt,
    subtotal: Number(o.Subtotal ?? o.subtotal ?? 0),
    tax: Number(o.Tax ?? o.tax ?? 0),
    total: Number(o.Total ?? o.total ?? 0),
    status: String(o.Status ?? o.status ?? "").trim(),
    items: (o.Items ?? o.items ?? []).map((it) => ({
      partId: it.PartId ?? it.partId,
      partName: it.PartName ?? it.partName,
      sku: it.Sku ?? it.sku,
      unitPrice: Number(it.UnitPrice ?? it.unitPrice ?? 0),
      quantity: Number(it.Quantity ?? it.quantity ?? 0),
      lineTotal: Number(it.LineTotal ?? it.lineTotal ?? 0),
    })),
    customerName: o.CustomerName ?? o.customerName ?? "",
    customerEmail: o.CustomerEmail ?? o.customerEmail ?? "",
    customerPhone: o.CustomerPhone ?? o.customerPhone ?? "",
    deliveryAddress: o.DeliveryAddress ?? o.deliveryAddress ?? "",
  };
}


export async function getMyOrders() {
  try {
    const { data } = await api.get("/api/Orders/my");
    const list = Array.isArray(data) ? data : (data?.items ?? []);
    return list.map(normalizeOrder);
  } catch (err) {
    if (err?.response?.status === 404) {
      // No Customer profile / no orders yet → behave as empty list
      return [];
    }
    throw err;
  }
}

// ✅ NEW: fetch a single order by id (customers can access their own order)
export async function getOrderById(id) {
  const { data } = await api.get(`/api/orders/${id}`);
  return normalizeOrder(data);
}
