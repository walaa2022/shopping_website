// script.js — homepage: search, favorites, add/remove cart, live cart badge + mini cart
document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "ProductsInCart";
  const FAV_KEY  = "Favorites";

  // --- Load & sanitize state ---
  function readArray(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  // cart is an array of objects: { id, title, price, qty, category, imageUrl }
  let cart = readArray(CART_KEY).filter(
    it => it && typeof it === "object" && "id" in it
  );
  // favs is an array of ids (strings)
  let favs = readArray(FAV_KEY).filter(
  it => it && typeof it === "object" && "id" in it
);

  // --- Helpers ---
  const $cards   = () => document.querySelectorAll(".products-grid .card");
  const $counts  = () => document.querySelectorAll(".cart-count");
  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const saveFavs = () => localStorage.setItem(FAV_KEY,  JSON.stringify(favs));
  const inCart   = (id) => cart.findIndex(p => p.id === id) > -1;
  const inFavs = (id) => favs.some(p => p.id === id);

  function cartTotalQty(){
    return cart.reduce((a,b)=> a + (Number(b.qty) || 1), 0);
  }

  function updateCounts(){
    const n = cartTotalQty();
    $counts().forEach(el => { el.textContent = n; });
  }

  function setBtnState(btn, isInCart){
    if (!btn) return;
    if (isInCart){
      btn.classList.add("remove");
      btn.textContent = "Remove from cart";
    } else {
      btn.classList.remove("remove");
      btn.textContent = "Add to cart";
    }
  }

  function ensureHeart(card){
    // If no heart exists yet, insert it left of the price
    let heart = card.querySelector(".icon-btn.heart");
    if (!heart){
      const row = card.querySelector(".card-row");
      if (row){
        heart = document.createElement("button");
        heart.type = "button";
        heart.className = "icon-btn heart";
        heart.innerHTML = `<i class="far fa-heart"></i>`;
        // place at the start of the row
        row.prepend(heart);
      }
    }
    return heart;
  }

  function renderPerCardState(card){
    const id    = card.dataset.sku || card.querySelector(".card-title")?.textContent?.trim() || "";
    const btn   = card.querySelector(".card .btn, .btn");
    const heart = ensureHeart(card);
    // cart state
    setBtnState(btn, inCart(id));
    // fav state
    if (heart){
      const isFav = inFavs(id);
      heart.classList.toggle("is-fav", isFav);
      // adjust icon style (solid vs regular)
      const i = heart.querySelector(".fa-heart");
      if (i) i.className = isFav ? "fas fa-heart" : "far fa-heart";
    }
  }

  // Mini cart dropdown (right under the cart icon)
  // Mini cart dropdown (items + qty + view-all button)
function renderMiniCart() {
  const box = document.getElementById("cart-dropdown");
  if (!box) return;

  if (!cart.length) {
    box.innerHTML = "<p style='padding:10px;color:#9ca3af'>Cart is empty.</p>";
    return;
  }

  box.innerHTML =
    cart.map((item, index) => `
      <div class="mini-item">
        <div class="mini-header">
          <span class="mini-title">${item.title}</span>
          <span class="mini-price">$${item.price}</span>
        </div>
        <div class="mini-qty">
          <button class="mini-btn" data-idx="${index}" data-op="-">−</button>
          <span class="mini-qty-value">${item.qty || 1}</span>
          <button class="mini-btn" data-idx="${index}" data-op="+">+</button>
        </div>
      </div>
    `).join("") +
    `
      <button type="button" class="btn mini-view-all" style="margin-top:8px;width:100%;">
        View All Products
      </button>
    `;
}


  // Initial UI sync for all cards
  $cards().forEach(card => renderPerCardState(card));
  updateCounts();
  renderMiniCart();

  // --- Add click handlers ---

  // 1) Add/Remove Cart (and store image + category)
  document.querySelectorAll(".products-grid .card .btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // FIX 1: Isolate the button click to prevent global handler crash
      const card = e.currentTarget.closest(".card");
      if (!card) return;

      const id       = card.dataset.sku || card.querySelector(".card-title")?.textContent?.trim() || "Item";
      const title    = card.querySelector(".card-title")?.textContent?.trim() || id;
      const price    = parseFloat(card.dataset.price || "0") || 0;
      const category = card.dataset.category || "";
      const imageUrl = card.querySelector(".card-media img")?.getAttribute("src") || "";

      const idx = cart.findIndex(p => p.id === id);
      if (idx > -1){
        // remove from cart (toggle)
        cart.splice(idx, 1);
      } else {
        // add to cart WITH image + category
        cart.push({ id, title, price, qty: 1, category, imageUrl });
      }
      saveCart();
      updateCounts();
      renderPerCardState(card);
      renderMiniCart();

      // small feedback
      btn.disabled = true;
      setTimeout(()=>{ btn.disabled = false; }, 300);
    });
  });

  // 2) Favorite heart toggle (event delegation so hearts inserted later still work)
// 2) Favorite heart toggle (event delegation so hearts inserted later still work)
document.addEventListener("click", (e) => {
  const heart = e.target.closest(".icon-btn.heart");
  if (!heart) return;
  const card = heart.closest(".card");
  if (!card) return;

  const id       = card.dataset.sku || card.querySelector(".card-title")?.textContent?.trim() || "Item";
  const title    = card.querySelector(".card-title")?.textContent?.trim() || id;
  const price    = parseFloat(card.dataset.price || "0") || 0;
  const category = card.dataset.category || "";
  const imageUrl = card.querySelector(".card-media img")?.getAttribute("src") || "";

  if (inFavs(id)) {
    // remove from favorites
    favs = favs.filter(p => p.id !== id);
  } else {
    // add full product object with image
    favs.push({ id, title, price, category, imageUrl });
  }

  saveFavs();
  renderPerCardState(card);
});

    // --- Mini cart interactions: +/- quantity and View All ---
  document.addEventListener("click", (e) => {
    // +/- buttons inside dropdown
    const miniBtn = e.target.closest(".mini-btn");
    if (miniBtn) {
     // Removed e.stopPropagation() to allow safe check in closing handler
      const idx = parseInt(miniBtn.dataset.idx, 10);
      const op  = miniBtn.dataset.op;
      if (!Number.isNaN(idx) && cart[idx]) {
        let qty = Number(cart[idx].qty) || 1;
        qty = op === "+" ? qty + 1 : qty - 1;

        if (qty <= 0) {
          // remove item when qty hits 0
          cart.splice(idx, 1);
        } else {
          cart[idx].qty = qty;
        }

        saveCart();
        updateCounts();
        renderMiniCart();
        // refresh buttons / hearts on product cards
        $cards().forEach(card => renderPerCardState(card));
      }
    }

    // "View All Products" button inside dropdown
    const viewAll = e.target.closest(".mini-view-all");
    if (viewAll) {
       // Removed e.stopPropagation() to allow safe check in closing handler
      window.location.href = "cart.html";
    }
  });


  // 3) Search with dropdown
  const searchType  = document.getElementById("search-type");
  const searchInput = document.getElementById("search-input");
  const searchBtn   = document.getElementById("search-btn");

  function performSearch() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const type = searchType?.value || "product";

    document.querySelectorAll(".products-grid .card").forEach(card => {
      const title    = card.querySelector(".card-title")?.textContent?.toLowerCase() || "";
      const category = card.dataset.category?.toLowerCase() || ""; // optional
      let show = false;

      if (!q) {
        show = true; // empty query shows all
      } else if (type === "product") {
        show = title.includes(q);
      } else if (type === "category") {
        show = category.includes(q);
      }

      card.style.display = show ? "" : "none";
    });
  }

  if (searchBtn) searchBtn.addEventListener("click", performSearch);
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") performSearch();
    });
  }

  // 4) Header cart link (badge already live; no special behavior needed)
  const shoppingCartLinks = document.querySelectorAll("a.shopping_cart");
  shoppingCartLinks.forEach(a => {
    a.addEventListener("click", (e) => {
        // If this link's default action is to navigate, it's fine.
    });
  });

   // --- Toggle mini-cart on click ---
  const cartToggle   = document.getElementById("cart-toggle");
  const cartDropdown = cartToggle?.closest('.cart_wrapper')?.querySelector('.carts_products'); 



  if (cartToggle && cartDropdown) {
    // Click cart icon → open/close dropdown
    cartToggle.addEventListener("click", (e) => {
      e.preventDefault();           // don’t navigate away
      cartDropdown.classList.toggle("show");
    });

    // Click outside → close dropdown
    document.addEventListener("click", (e) => {
      // FIX 2: Safety check to prevent closing when clicking quantity buttons
      const isMiniCartBtn = e.target.closest(".mini-btn") || e.target.closest(".mini-view-all");
      if (isMiniCartBtn) return;

      const clickedInsideDropdown = cartDropdown.contains(e.target);
      const clickedOnToggle       = cartToggle.contains(e.target);

      if (!clickedInsideDropdown && !clickedOnToggle) {
        cartDropdown.classList.remove("show");
      }
    });
  }

});