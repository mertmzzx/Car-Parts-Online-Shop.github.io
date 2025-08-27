import api from "./http";

// 👇 matches Swagger: GET /api/Parts, GET /api/Parts/{id}
const PRODUCTS_PATH = "/api/Parts";
const PAGE_PARAM   = "page";
const SIZE_PARAM   = "pageSize";
const SEARCH_PARAM = "q";

/** List parts (products) */
export async function getProducts({ page = 1, size = 12, search = "" } = {}) {
  const params = { [PAGE_PARAM]: page, [SIZE_PARAM]: size };
  if (search) params[SEARCH_PARAM] = search;

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
