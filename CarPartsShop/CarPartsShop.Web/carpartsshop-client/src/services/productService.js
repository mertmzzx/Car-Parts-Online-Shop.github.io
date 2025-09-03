import api from "./http";

// Endpoints & param keys
const PRODUCTS_PATH = "/api/Parts";
const PAGE_PARAM    = "page";
const SIZE_PARAM    = "pageSize";
const SEARCH_PARAM  = "q";

/**
 * List parts (products)
 * Supports:
 * - page, size
 * - search (q)
 * - categoryId
 * - minPrice, maxPrice
 * - sort: "newest" | "name" | "price" | "price_desc"
 */
export async function getProducts({
  page = 1,
  size = 12,
  search = "",
  categoryId = null,
  minPrice = null,
  maxPrice = null,
  sort = "newest",
} = {}) {
  const params = {
    [PAGE_PARAM]: page,
    [SIZE_PARAM]: size,
  };

  if (search && search.trim()) params[SEARCH_PARAM] = search.trim();
  if (categoryId != null) params.categoryId = categoryId;
  if (minPrice != null && minPrice !== "") params.minPrice = minPrice;
  if (maxPrice != null && maxPrice !== "") params.maxPrice = maxPrice;
  if (sort) params.sort = sort;

  const res = await api.get(PRODUCTS_PATH, { params });

  // Body can be array or { items, total }
  const items = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
  const hdr = res.headers["x-total-count"] ?? res.headers["X-Total-Count"];
  const total = Number(hdr ?? res.data?.total ?? items.length);

  return { items, total, page, size };
}

/** Single part by id */
export async function getProductById(id) {
  const { data } = await api.get(`${PRODUCTS_PATH}/${id}`);
  return data;
}
