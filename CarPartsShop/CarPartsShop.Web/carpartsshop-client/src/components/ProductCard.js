// src/components/ProductCard.js
import { useMemo } from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../services/http";

/** Local inline SVG placeholder (works offline) */
function svgPlaceholder(text = "Part") {
  const t = encodeURIComponent(text);
  return (
    "data:image/svg+xml;utf8," +
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
       <rect width='100%' height='100%' fill='#e9ecef'/>
       <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
             font-family='Arial, Helvetica, sans-serif' font-size='20' fill='#6c757d'>${t}</text>
     </svg>`
  );
}

/** Build a final image URL, respecting data: and absolute URLs */
function resolveImageUrl(imageUrl, name) {
  if (!imageUrl) return svgPlaceholder(name || "Part");

  // ✅ Keep inline data URIs intact
  if (imageUrl.startsWith("data:")) return imageUrl;

  // ✅ Keep absolute http(s) URLs intact
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;

  // ✅ If it’s a server-relative path, prefix with API base
  if (imageUrl.startsWith("/")) {
    const base = (api.defaults.baseURL || "").replace(/\/+$/, "");
    return `${base}${imageUrl}`;
  }

  // Anything weird → fallback to local SVG
  return svgPlaceholder(name || "Part");
}

export default function ProductCard({ product, onAdd }) {
  const { id, name, price, imageUrl } = product;

  const src = useMemo(
    () => resolveImageUrl(imageUrl, name),
    [imageUrl, name]
  );

  const handleImgError = (e) => {
    e.currentTarget.src = svgPlaceholder(name || "Part");
  };

  return (
    <Card className="h-100 shadow-sm">
      <Link to={`/products/${id}`} className="text-decoration-none text-dark">
        <Card.Img
          variant="top"
          src={src}
          alt={name}
          onError={handleImgError}
          style={{ objectFit: "cover", height: 180 }}
        />
      </Link>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-6 flex-grow-1">{name}</Card.Title>
        <div className="d-flex align-items-center justify-content-between">
          <div className="fw-semibold">${Number(price).toFixed(2)}</div>
          <Button size="sm" onClick={() => onAdd?.(product)}>
            Add to Cart
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
