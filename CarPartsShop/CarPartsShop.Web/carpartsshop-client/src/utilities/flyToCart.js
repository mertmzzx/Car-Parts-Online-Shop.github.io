// src/utils/flyToCart.js
export function flyToCart(imgSrc, startEl, cartSelector = ".cart-fab") {
  const cartEl = document.querySelector(cartSelector);
  if (!cartEl || !startEl) return;

  const startBox = startEl.getBoundingClientRect();
  const endBox = cartEl.getBoundingClientRect();

  const img = document.createElement("img");
  img.src = imgSrc || "https://placehold.co/50x50?text=Part";
  img.style.position = "fixed";
  img.style.left = `${startBox.left}px`;
  img.style.top = `${startBox.top}px`;
  img.style.width = `${startBox.width}px`;
  img.style.height = `${startBox.height}px`;
  img.style.objectFit = "cover";
  img.style.borderRadius = "8px";
  img.style.zIndex = "2000";
  img.style.transition =
    "all 0.8s cubic-bezier(0.4, -0.3, 0.2, 1.5)";

  document.body.appendChild(img);
  void img.getBoundingClientRect(); // reflow

  img.style.left = `${endBox.left + endBox.width / 2 - startBox.width / 4}px`;
  img.style.top = `${endBox.top + endBox.height / 2 - startBox.height / 4}px`;
  img.style.width = `${startBox.width / 2}px`;
  img.style.height = `${startBox.height / 2}px`;
  img.style.opacity = "0.4";
  img.style.transform = "rotate(360deg)";

  img.addEventListener(
    "transitionend",
    () => {
      img.remove();
      // 👇 trigger the cart pop animation
      cartEl.classList.add("cart-pop-anim");
      cartEl.addEventListener(
        "animationend",
        () => cartEl.classList.remove("cart-pop-anim"),
        { once: true }
      );
    },
    { once: true }
  );
}
