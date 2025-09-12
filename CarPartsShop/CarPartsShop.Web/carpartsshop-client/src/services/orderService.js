// src/services/orderService.js
import api from "./http";

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

/** GET /api/Orders/my – returns [] if no customer profile / no orders yet */
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
