import { useEffect, useMemo, useState, useRef } from "react";
import {
  Row, Col, Form, InputGroup, Button, Pagination, Spinner, Badge, Stack,
} from "react-bootstrap";
import ProductCard from "../../components/ProductCard";
import CategoriesSidebar from "../../components/CategoriesSidebar";
import PriceRangeSlider from "../../components/PriceRangeSlider";
import { getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";

export default function Products() {
  const { add } = useCart();

  const allCatsRef = useRef(new Map());   // cache of all categories encountered 
  const [allCategories, setAllCategories] = useState([]); // array for rendering

  // data & ui
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(12);

  // filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [minPrice, setMinPrice] = useState(""); // "" = unset
  const [maxPrice, setMaxPrice] = useState(""); // "" = unset
  const [sort, setSort] = useState("newest");

  // loading/error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(overrides = {}) {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts({
        page,
        size,
        search,
        categoryId,
        minPrice: minPrice === "" ? null : minPrice,
        maxPrice: maxPrice === "" ? null : maxPrice,
        sort,
        ...overrides, 
      });
      setItems(data.items || []);
      setTotal(data.total || 0);

      if (overrides.page != null) setPage(overrides.page);
      if (overrides.categoryId !== undefined) setCategoryId(overrides.categoryId);
      if (overrides.sort !== undefined) setSort(overrides.sort);
      if (overrides.search !== undefined) setSearch(overrides.search);
      if (overrides.minPrice !== undefined) setMinPrice(overrides.minPrice === null ? "" : overrides.minPrice);
      if (overrides.maxPrice !== undefined) setMaxPrice(overrides.maxPrice === null ? "" : overrides.maxPrice);
    } catch (e) {
      console.error("Products load error:", e?.response?.status, e?.response?.data || e?.message);
      setError(`Failed to load products${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}.`);
    } finally {
      setLoading(false);
    }
  }

  // auto-load on page/category/sort changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryId, sort]);

  // keep a growing set of categories (does not shrink on filter)
  useEffect(() => {
    let changed = false;
    for (const it of items) {
      if (!it) continue;
      const id = it.categoryId;
      const name = it.categoryName || "Other";
      if (!allCatsRef.current.has(id)) {
        allCatsRef.current.set(id, { id, name });
        changed = true;
      }
    }
    if (changed) {
      const next = Array.from(allCatsRef.current.values())
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setAllCategories(next);
    }
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  function handleSubmit(e) {
    e.preventDefault();
    load({ page: 1, search });
  }

  const categories = useMemo(() => {
    const counts = new Map();
    for (const it of items) {
      if (!it) continue;
      const id = it.categoryId;
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    return allCategories.map(c => ({ ...c, count: counts.get(c.id) || 0 }));
  }, [allCategories, items]);

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.id === categoryId)?.name || null,
    [categories, categoryId]
  );

  // slider bounds
  const SLIDER_MIN = 0;
  const computedMax = useMemo(() => {
    const maxFromItems = items.reduce((m, it) => Math.max(m, Number(it.price) || 0), 0);
    return Math.max(100, Math.ceil(maxFromItems / 50) * 50);
  }, [items]);
  const SLIDER_MAX = computedMax || 1000;
  const SLIDER_STEP = 1;

  const hasAnyFilter =
    !!selectedCategoryName ||
    !!search.trim() ||
    minPrice !== "" ||
    maxPrice !== "" ||
    (sort && sort !== "newest");

  function clearFilters() {
    load({ page: 1, search: "", categoryId: null, minPrice: null, maxPrice: null, sort: "newest" });
  }

  return (
    <>
      <div className="header-gap" />

      <Row className="g-3">
        <Col xs={12} md={3} lg={2}>
          <div className="ms-2 ms-md-3">
            <CategoriesSidebar
              categories={categories}
              selectedCategoryId={categoryId}
              onSelect={(id) => {
                // keep page in sync & load via effect
                setCategoryId(id);
                setPage(1);
              }}
            />
          </div>
        </Col>

        <Col xs={12} md={9} lg={10}>
          {/* Filters bar with pills + Clear */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <Stack direction="horizontal" gap={2} className="flex-wrap">
              <span className="text-muted small">Filters:</span>

              {selectedCategoryName && (
                <Badge bg="light" text="dark" className="border">
                  Category: {selectedCategoryName}{" "}
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 ms-1 align-baseline"
                    onClick={() => load({ page: 1, categoryId: null })}
                    aria-label="Clear category"
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {search.trim() && (
                <Badge bg="light" text="dark" className="border">
                  Search: “{search.trim()}”{" "}
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 ms-1 align-baseline"
                    onClick={() => load({ page: 1, search: "" })}
                    aria-label="Clear search"
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {minPrice !== "" && (
                <Badge bg="light" text="dark" className="border">
                  Min: ${minPrice}{" "}
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 ms-1 align-baseline"
                    onClick={() => load({ page: 1, minPrice: null })}
                    aria-label="Clear min price"
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {maxPrice !== "" && (
                <Badge bg="light" text="dark" className="border">
                  Max: ${maxPrice}{" "}
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 ms-1 align-baseline"
                    onClick={() => load({ page: 1, maxPrice: null })}
                    aria-label="Clear max price"
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {sort !== "newest" && (
                <Badge bg="light" text="dark" className="border">
                  Order: {sortLabel(sort)}{" "}
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 ms-1 align-baseline"
                    onClick={() => load({ page: 1, sort: "newest" })}
                    aria-label="Clear sort"
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </Stack>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={clearFilters}
              disabled={!hasAnyFilter}
            >
              Clear filters
            </Button>
          </div>

          {/* Search + Price slider + Sort */}
          <Form onSubmit={handleSubmit} className="mb-3">
            <Row className="g-2 align-items-end">
              <Col md={4}>
                <Form.Label className="small">Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by name, SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit">Go</Button>
                </InputGroup>
              </Col>

              <Col md={5}>
                <Form.Label className="small d-flex justify-content-between">
                  <span>Price Range</span>
                  <span className="text-muted">
                    {minPrice !== "" ? `$${minPrice}` : `$${SLIDER_MIN}`} –{" "}
                    {maxPrice !== "" ? `$${maxPrice}` : `$${SLIDER_MAX}`}
                  </span>
                </Form.Label>

                <PriceRangeSlider
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  step={SLIDER_STEP}
                  valueMin={minPrice === "" ? SLIDER_MIN : Number(minPrice)}
                  valueMax={maxPrice === "" ? SLIDER_MAX : Number(maxPrice)}
                  onChange={(lo, hi) => {
                    // update state live for the label + pills
                    setMinPrice(lo);
                    setMaxPrice(hi);
                  }}
                  onCommit={(lo, hi) => {
                    // treat full-range as "no filter"
                    const minParam = lo <= SLIDER_MIN ? null : Number(lo);
                    const maxParam = hi >= SLIDER_MAX ? null : Number(hi);
                    load({ page: 1, minPrice: minParam, maxPrice: maxParam });
                  }}
                />

                {/* precise inputs under the slider (optional) */}
                <div className="d-flex gap-2 mt-2">
                  <InputGroup size="sm" style={{ maxWidth: 160 }}>
                    <InputGroup.Text>Min</InputGroup.Text>
                    <Form.Control
                      type="number"
                      min={SLIDER_MIN}
                      max={SLIDER_MAX}
                      step={SLIDER_STEP}
                      value={minPrice}
                      onChange={(e) =>
                        setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      onBlur={() => load({ page: 1, minPrice: minPrice === "" ? null : Number(minPrice) })}
                    />
                  </InputGroup>
                  <InputGroup size="sm" style={{ maxWidth: 160 }}>
                    <InputGroup.Text>Max</InputGroup.Text>
                    <Form.Control
                      type="number"
                      min={SLIDER_MIN}
                      max={SLIDER_MAX}
                      step={SLIDER_STEP}
                      value={maxPrice}
                      onChange={(e) =>
                        setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      onBlur={() => load({ page: 1, maxPrice: maxPrice === "" ? null : Number(maxPrice) })}
                    />
                  </InputGroup>
                </div>
              </Col>

              <Col md={3}>
                <Form.Label className="small">Order By</Form.Label>
                <Form.Select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name A–Z</option>
                  <option value="price">Price Low→High</option>
                  <option value="price_desc">Price High→Low</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>

          {loading && (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div className="text-muted">No products found.</div>
          )}

          <Row xs={1} sm={2} md={3} lg={3} className="g-3">
            {items.map((p) => (
              <Col key={p.id}>
                <ProductCard product={p} onAdd={add} />
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First onClick={() => load({ page: 1 })} disabled={page === 1} />
                <Pagination.Prev
                  onClick={() => load({ page: Math.max(1, page - 1) })}
                  disabled={page === 1}
                />
                <Pagination.Item active>{page}</Pagination.Item>
                <Pagination.Next
                  onClick={() => load({ page: Math.min(totalPages, page + 1) })}
                  disabled={page === totalPages}
                />
                <Pagination.Last
                  onClick={() => load({ page: totalPages })}
                  disabled={page === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Col>
      </Row>
    </>
  );
}

function sortLabel(value) {
  switch (value) {
    case "name":
      return "Name A–Z";
    case "price":
      return "Price Low→High";
    case "price_desc":
      return "Price High→Low";
    case "newest":
    default:
      return "Newest";
  }
}
