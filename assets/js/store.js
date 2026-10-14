/* TAJ COLLECTIONS — shared store logic (cart, components) */
const BRAND = "TAJ COLLECTIONS";
const WA_NUMBER = "923001234567"; // placeholder WhatsApp number

/* ---------- cart ---------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem("taj_cart") || "[]"); }
  catch { return []; }
}
function saveCart(c) { localStorage.setItem("taj_cart", JSON.stringify(c)); }
function cartCount() { return getCart().reduce((n, i) => n + i.qty, 0); }
function cartTotal() {
  return getCart().reduce((s, i) => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
}
function addToCart(id, qty = 1, color = null, size = null) {
  const cart = getCart();
  const key = id + "|" + (color || "") + "|" + (size || "");
  const found = cart.find(i => i.key === key);
  if (found) found.qty += qty;
  else cart.push({ key, id, qty, color, size });
  saveCart(cart); updateCartBadge();
}
function setQty(key, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter(i => i.key !== key);
  else { const f = cart.find(i => i.key === key); if (f) f.qty = qty; }
  saveCart(cart); updateCartBadge();
}
function clearCart() { saveCart([]); updateCartBadge(); }
function updateCartBadge() {
  document.querySelectorAll(".cart-count").forEach(el => {
    const n = cartCount();
    el.textContent = n; el.style.display = n > 0 ? "flex" : "none";
  });
}
const fmt = n => "Rs " + n.toLocaleString("en-PK");

/* ---------- product card ---------- */
function productCard(p) {
  return `
  <div class="group bg-[#f7f5f2] rounded-2xl overflow-hidden border border-black/5 hover:border-[#f97316]/40 transition-all duration-300 hover:-translate-y-1">
    <a href="product.html?section=${p.section}&id=${p.id}" class="block relative overflow-hidden aspect-square">
      <img src="assets/img/${p.img}" alt="${p.name}" loading="lazy"
           class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
      <span class="absolute top-3 left-3 bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">${p.badge}</span>
      <button onclick="event.preventDefault();quickAdd('${p.id}')"
            class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-sm font-semibold px-5 py-2 rounded-full whitespace-nowrap hover:bg-[#ea580c] transition shadow-lg">Quick Add +</button>
    </a>
    <div class="p-5">
      <p class="text-xs uppercase tracking-widest text-[#f97316] mb-1">${CATS[p.cat].name}</p>
      <a href="product.html?section=${p.section}&id=${p.id}"><h3 class="font-serif text-lg text-[#1c1917] hover:text-[#f97316] transition">${p.name}</h3></a>
      <div class="mt-2 flex items-center gap-2">
        <span class="text-[#f97316] font-bold text-lg">${fmt(p.price)}</span>
        <span class="text-[#a8a29e] line-through text-sm">${fmt(p.oldPrice)}</span>
      </div>
    </div>
  </div>`;
}
function quickAdd(id) {
  const p = PRODUCTS.find(p => p.id === id);
  addToCart(id, 1, p.colors[0], p.sizes[0]);
  toast(`${p.name} added to cart`);
}

/* ---------- toast ---------- */
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#f97316] text-white font-semibold px-6 py-3 rounded-full shadow-2xl z-[100] transition-all duration-300 opacity-0 translate-y-4";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.remove("opacity-0", "translate-y-4");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.add("opacity-0", "translate-y-4"), 2200);
}

/* ---------- shared chrome ---------- */
function renderChrome(active = "") {
  const nav = (href, label, key) =>
    `<a href="${href}" class="hover:text-[#f97316] transition ${active === key ? "text-[#f97316]" : "text-[#57534e]"}">${label}</a>`;
  document.getElementById("site-header").innerHTML = `
    <div class="bg-[#f97316] text-white text-center text-xs sm:text-sm font-semibold py-2 px-4">
      FREE nationwide delivery on orders over ${fmt(FREE_SHIP_THRESHOLD)} · Cash on Delivery available
    </div>
    <nav class="bg-[#ffffff]/95 backdrop-blur border-b border-black/10 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="index.html" class="font-serif text-2xl tracking-wide text-[#1c1917]">TAJ <span class="text-[#f97316]">COLLECTIONS</span></a>
        <div class="hidden md:flex items-center gap-8 text-sm font-medium">
          ${nav("index.html", "Home", "gateway")}
          ${nav("leathers.html", "TAJ Leathers", "leathers-home")}
          ${nav("fabrics.html", "TAJ Fabrics", "fabrics-home")}
        </div>
        <div class="flex items-center gap-4">
          <a href="cart.html" class="relative text-[#57534e] hover:text-[#f97316] transition" aria-label="Cart">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H19M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
            <span class="cart-count absolute -top-2 -right-2 bg-[#f97316] text-white text-[10px] font-bold w-5 h-5 rounded-full items-center justify-center" style="display:none">0</span>
          </a>
          <button id="menu-btn" class="md:hidden text-[#57534e]" aria-label="Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <div id="mobile-menu" class="md:hidden hidden border-t border-black/10 px-4 py-3 flex flex-col gap-3 text-sm">
        ${nav("index.html", "Home", "gateway")}
        ${nav("leathers.html", "TAJ Leathers", "leathers-home")}
        ${nav("fabrics.html", "TAJ Fabrics", "fabrics-home")}
      </div>
    </nav>`;
  document.getElementById("menu-btn").addEventListener("click", () =>
    document.getElementById("mobile-menu").classList.toggle("hidden"));

  document.getElementById("site-footer").innerHTML = `
    <footer class="bg-[#ffffff] border-t border-black/10 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <p class="font-serif text-2xl text-[#1c1917] mb-4">TAJ <span class="text-[#f97316]">COLLECTIONS</span></p>
          <p class="text-[#78716c] text-sm leading-relaxed">Premium leather goods and unstitched fabrics from Pakistan. Honest prices, honest quality.</p>
        </div>
        <div>
          <p class="text-[#1c1917] font-semibold mb-4 text-sm uppercase tracking-widest">TAJ Leathers</p>
          <div class="flex flex-col gap-2 text-sm text-[#78716c]">
            <a href="category.html?section=leathers&cat=belts" class="hover:text-[#f97316]">Belts</a>
            <a href="category.html?section=leathers&cat=wallets" class="hover:text-[#f97316]">Wallets</a>
            <a href="category.html?section=leathers&cat=straps" class="hover:text-[#f97316]">Watch Straps</a>
            <a href="leathers.html" class="hover:text-[#f97316]">Leathers Home</a>
          </div>
        </div>
        <div>
          <p class="text-[#1c1917] font-semibold mb-4 text-sm uppercase tracking-widest">TAJ Fabrics</p>
          <div class="flex flex-col gap-2 text-sm text-[#78716c]">
            <a href="category.html?section=fabrics&cat=washwear" class="hover:text-[#f97316]">Wash & Wear</a>
            <a href="category.html?section=fabrics&cat=cotton" class="hover:text-[#f97316]">Cotton</a>
            <a href="category.html?section=fabrics&cat=khaddar" class="hover:text-[#f97316]">Khaddar</a>
            <a href="category.html?section=fabrics&cat=boski" class="hover:text-[#f97316]">Boski</a>
          </div>
        </div>
        <div>
          <p class="text-[#1c1917] font-semibold mb-4 text-sm uppercase tracking-widest">Contact</p>
          <div class="flex flex-col gap-2 text-sm text-[#78716c]">
            <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener" class="hover:text-[#f97316]">WhatsApp: +92 300 1234567</a>
            <span>hello@tajcollections.pk</span>
            <span>Lahore, Pakistan</span>
          </div>
        </div>
      </div>
      <div class="border-t border-black/10 py-6 text-center text-xs text-[#a8a29e] px-4">
        © 2026 TAJ COLLECTIONS. All rights reserved. Crafted with pride in Pakistan.
      </div>
    </footer>
    <a href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Assalam-o-Alaikum! I have a question about TAJ COLLECTIONS products.")}"
       target="_blank" rel="noopener" aria-label="Chat on WhatsApp"
       class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
      <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 019.88 9.89c0 5.45-4.44 9.88-9.89 9.88M20.5 3.49A11.8 11.8 0 0012.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.44-8.41"/></svg>
    </a>`;
  updateCartBadge();
}
document.addEventListener("DOMContentLoaded", updateCartBadge);
