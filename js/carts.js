// carts.js — cart page: cards with image + qty, plus favorites
document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "ProductsInCart";
  const FAV_KEY  = "Favorites";

  // Main cart elements
  const helloEl   = document.getElementById("hello");
  const listEl    = document.getElementById("cart-list");
  const emptyEl   = document.getElementById("cart-empty");
  const grandEl   = document.getElementById("cart-grand");

  // Favorites area
  const favWrap   = document.getElementById("favorites-list");
  const favEmpty  = document.getElementById("fav-empty");

  const countEls  = () => document.querySelectorAll(".cart-count");

  // Greeting
  const name = sessionStorage.getItem("username") || localStorage.getItem("username");
  if (helloEl) helloEl.textContent = name ? `Hello, ${name}` : "Hello";

  // --- Helpers ---
  function getCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch { return []; }
  }
  function saveCart(items){
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
  function getFavs(){
    try {
      const v = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  }
  function saveFavs(items){
    localStorage.setItem(FAV_KEY, JSON.stringify(items));
  }
  function money(n){ return "$" + (Math.round(n*100)/100).toFixed(2); }
  function updateHeaderCount(items){
    const n = items.reduce((a,b)=>a+(Number(b.qty)||1),0);
    countEls().forEach(el => el.textContent = n);
  }

  // --- Render cart as cards (with image + qty) ---
  function renderCart(){
    const items = getCart();
    updateHeaderCount(items);

    if (!listEl || !emptyEl || !grandEl) return;

    listEl.innerHTML = "";
    if (!items.length){
      emptyEl.style.display = "block";
      grandEl.textContent = "$0.00";
      return;
    }
    emptyEl.style.display = "none";

    let total = 0;

    items.forEach((it, idx) => {
      const qty   = Number(it.qty) || 1;
      const price = Number(it.price) || 0;
      total += qty * price;

      const card = document.createElement("div");
      card.className = "cart-item";
      card.innerHTML = `
        <img src="${it.imageUrl || 'images/placeholder.jpg'}" alt="${it.title || it.id}">
        <div>
          <h3>${it.title || it.id}</h3>
          <div class="meta">Category: ${it.category || "—"}</div>
          <div class="meta">Price: ${money(price)}</div>
          <div class="qty-controls">
            <button class="qty-btn" data-idx="${idx}" data-op="-">−</button>
            <span class="qty">${qty}</span>
            <button class="qty-btn" data-idx="${idx}" data-op="+">+</button>
          </div>
        </div>
        <div>
          <button class="btn remove remove-from-cart" data-idx="${idx}">Remove from Cart</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    grandEl.textContent = money(total);
  }

  // --- Render favorites (using full objects with imageUrl) ---
  function renderFavs(){
    if (!favWrap || !favEmpty) return;

    const favs = getFavs();
    favWrap.innerHTML = "";

    if (!favs.length){
      favEmpty.style.display = "block";
      return;
    }
    favEmpty.style.display = "none";

    favs.forEach((it, idx) => {
      const card = document.createElement("div");
      card.className = "cart-item";
      card.innerHTML = `
        <img src="${it.imageUrl || 'images/placeholder.jpg'}" alt="${it.title || it.id}">
        <div>
          <h3>${it.title || it.id}</h3>
          <div class="meta">Category: ${it.category || "—"}</div>
          <div class="meta">Price: ${money(it.price || 0)}</div>
        </div>
        <div>
          <button class="btn remove remove-fav" data-id="${it.id}">Remove ♥</button>
        </div>
      `;
      favWrap.appendChild(card);
    });
  }

  // --- Events: qty -, qty +, remove from cart, clear cart, remove favorite ---
  document.addEventListener("click", (e) => {
    const minus     = e.target.closest(".qty-btn[data-op='-']");
    const plus      = e.target.closest(".qty-btn[data-op='+']");
    const rem       = e.target.closest(".remove-from-cart");
    const clearBtn  = e.target.closest("#clear-cart");
    const remFavBtn = e.target.closest(".remove-fav");

    if (minus || plus){
      const idx = +(minus?.dataset.idx || plus?.dataset.idx);
      const items = getCart();
      if (!items[idx]) return;
      items[idx].qty = (Number(items[idx].qty)||1) + (plus ? 1 : -1);
      if (items[idx].qty <= 0) items.splice(idx, 1);
      saveCart(items);
      renderCart();
    }

    if (rem){
      const idx = +rem.dataset.idx;
      const items = getCart();
      items.splice(idx, 1);
      saveCart(items);
      renderCart();
    }

    if (clearBtn){
      localStorage.removeItem(CART_KEY);
      renderCart();
    }

    if (remFavBtn){
      const id = remFavBtn.dataset.id;
      const favs = getFavs().filter(x => x.id !== id);
      saveFavs(favs);
      renderFavs();
    }
  });

  // Initial render
  renderCart();
  renderFavs();
});
