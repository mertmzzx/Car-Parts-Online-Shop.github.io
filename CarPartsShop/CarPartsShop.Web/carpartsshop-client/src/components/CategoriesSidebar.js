// src/components/CategoriesSidebar.js
import { useMemo, useState } from "react";
import { Card, Button, Collapse, ListGroup } from "react-bootstrap";

/**
 * Props:
 * - categories: [{ id, name, count }]
 * - selectedCategoryId: number | null
 * - onSelect: (id|null) => void
 */
export default function CategoriesSidebar({
  categories = [],
  selectedCategoryId = null,
  onSelect,
}) {
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...categories].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "")
      ),
    [categories]
  );

  const hasSelection =
    selectedCategoryId !== null && selectedCategoryId !== undefined;

  return (
    <Card className="sidebar-card shadow-sm">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <span className="fw-semibold">Categories</span>
        {/* Mobile toggle only */}
        <Button
          size="sm"
          variant="outline-primary"
          className="d-md-none"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="categories-collapse"
        >
          {open ? "Hide" : "Show"}
        </Button>
      </Card.Header>

      <Collapse in={open} dimension="height">
        <div id="categories-collapse" className="d-md-block">
          <Card.Body className="py-2">
            <ListGroup variant="flush" className="sidebar-list">
              <ListGroup.Item
                action
                active={!hasSelection}
                onClick={() => onSelect?.(null)}
                className="d-flex justify-content-between align-items-center"
              >
                <span className="text-truncate">All</span>
              </ListGroup.Item>

              {sorted.map((c) => (
                <ListGroup.Item
                  key={c.id ?? c.name}
                  action
                  active={selectedCategoryId === c.id}
                  onClick={() => onSelect?.(c.id)}
                  className="d-flex justify-content-between align-items-center"
                  title={c.name}
                >
                  <span className="text-truncate">{c.name || "Unnamed"}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
}

/*function sumCounts(arr) {
  let n = 0;
  for (const x of arr) if (typeof x?.count === "number") n += x.count;
  return n;
} */
