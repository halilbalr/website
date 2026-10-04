/* Tillstånd (varukorg, favoriter m.m.), prisberäkning och hjälpfunktioner. */
(function () {
  const { products, categories, goals, brands, diets, forms, RI } = window.CATALOG;
  const SHOP = window.SHOP;

  /* ---------- Lagring (tål blockerad localStorage) ---------- */
  const memory = {};
  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem("sundla:" + key);
        return raw == null ? (key in memory ? memory[key] : fallback) : JSON.parse(raw);
      } catch (e) {
        return key in memory ? memory[key] : fallback;
      }
    },
    set(key, value) {
      memory[key] = value;
      try { localStorage.setItem("sundla:" + key, JSON.stringify(value)); } catch (e) { /* privat läge */ }
    }
  };

  /* ---------- Uppslag ---------- */
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const catById = new Map(categories.map((c) => [c.id, c]));
  const goalById = new Map(goals.map((g) => [g.id, g]));
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const dietById = new Map(diets.map((d) => [d.id, d]));

  const getVariant = (p, variantId) => p.variants.find((v) => v.id === variantId) || p.variants[0];
  const isNew = (p) => (Date.now() - new Date(p.added).getTime()) / 864e5 <= 60;
  const lowestPrice = (p) => Math.min(...p.variants.map((v) => v.price));
  const onSale = (p) => p.variants.some((v) => v.was && v.was > v.price);
  const stockState = (p) => (p.stock <= 0 ? "out" : p.stock < 10 ? "low" : "in");

  /* ---------- Format ---------- */
  const nf2 = new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf0 = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
  const nfAuto = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 });
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  function money(n) {
    const r = round2(n);
    return (Number.isInteger(r) ? nf0.format(r) : nf2.format(r)) + " kr";
  }
  const money2 = (n) => nf2.format(round2(n)) + " kr";
  const num = (n) => nfAuto.format(n);

  function unitPrices(p, v) {
    const out = { perDose: v.servings ? v.price / v.servings : null, compare: null };
    if (v.g) out.compare = { value: (v.price / v.g) * 1000, unit: "kg" };
    else if (v.ml) out.compare = { value: (v.price / v.ml) * 1000, unit: "l" };
    else if (v.count && p.form !== "paket") out.compare = { value: v.price / v.count, unit: "st" };
    return out;
  }

  function nutritionRows(p) {
    if (!p.nutrition || !p.nutrition.rows) return [];
    return p.nutrition.rows.map(([key, amount, unit, label]) => {
      const ref = RI[key];
      if (ref) {
        const pct = Math.round((amount / ref.ri) * 100);
        return { name: label || ref.name, amount: typeof amount === "number" ? `${num(amount)} ${ref.unit}` : amount, ri: pct, sub: false };
      }
      const sub = /^varav /.test(key);
      return { name: key, amount: typeof amount === "number" ? `${num(amount)} ${unit || ""}`.trim() : amount, ri: null, sub };
    });
  }

  /* ---------- Sök ---------- */
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const searchIndex = new Map(products.map((p) => [p.id, norm([
    p.name, p.label, p.sub, brandById.get(p.brand).name, catById.get(p.cat).name,
    p.goals.map((g) => goalById.get(g).name).join(" "), p.keywords, p.short, (p.flavors || []).join(" "), forms[p.form].name
  ].join(" "))]));

  function search(query) {
    const terms = norm(query).split(" ").filter(Boolean);
    if (!terms.length) return [];
    return products
      .map((p) => {
        const hay = searchIndex.get(p.id);
        const name = norm(p.name);
        let score = 0;
        for (const t of terms) {
          if (!hay.includes(t)) return null;
          score += name.includes(t) ? (name.startsWith(t) ? 6 : 4) : 1;
        }
        return { p, score: score + p.sold / 20000 };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  }

  /* ---------- Seedad slump (stabila recensioner) ---------- */
  function rng(seed) {
    let h = 2166136261;
    for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => {
      h += 0x6d2b79f5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Varukorg ---------- */
  const listeners = new Set();
  const state = {
    cart: storage.get("cart", []),
    code: storage.get("code", null),
    favorites: storage.get("favorites", []),
    compare: storage.get("compare", []),
    recent: storage.get("recent", []),
    orders: storage.get("orders", []),
    reviews: storage.get("reviews", {}),
    watch: storage.get("watch", []),
    profile: storage.get("profile", {}),
    subsPaused: storage.get("subsPaused", {})
  };
  // Rensa poster som inte längre finns i sortimentet
  state.cart = state.cart.filter((i) => byId.has(i.productId));
  state.favorites = state.favorites.filter((id) => byId.has(id));
  state.compare = state.compare.filter((id) => byId.has(id));

  function commit(...keys) {
    keys.forEach((k) => storage.set(k, state[k]));
    listeners.forEach((fn) => fn(keys));
  }
  const subscribe = (fn) => listeners.add(fn);

  const lineKey = (productId, variantId, flavor, sub) => [productId, variantId, flavor || "", sub || 0].join("|");

  function addToCart({ productId, variantId, flavor = null, qty = 1, sub = 0 }) {
    const p = byId.get(productId);
    if (!p || p.stock <= 0) return null;
    const v = getVariant(p, variantId);
    const f = flavor || (p.flavors ? p.flavors[0] : null);
    const key = lineKey(p.id, v.id, f, sub);
    const existing = state.cart.find((i) => i.key === key);
    const max = Math.min(p.stock, 20);
    if (existing) existing.qty = Math.min(max, existing.qty + qty);
    else state.cart.unshift({ key, productId: p.id, variantId: v.id, flavor: f, qty: Math.min(max, qty), sub });
    commit("cart");
    return { p, v, flavor: f };
  }
  function setQty(key, qty) {
    const item = state.cart.find((i) => i.key === key);
    if (!item) return;
    const p = byId.get(item.productId);
    item.qty = Math.max(1, Math.min(Math.min(p.stock, 20), Math.round(qty) || 1));
    commit("cart");
  }
  function removeLine(key) {
    const idx = state.cart.findIndex((i) => i.key === key);
    if (idx < 0) return null;
    const [removed] = state.cart.splice(idx, 1);
    commit("cart");
    return { item: removed, index: idx };
  }
  function restoreLine({ item, index }) {
    state.cart.splice(index, 0, item);
    commit("cart");
  }
  function clearCart() { state.cart = []; state.code = null; commit("cart", "code"); }
  const cartCount = () => state.cart.reduce((n, i) => n + i.qty, 0);

  /* ---------- Prisberäkning (ren funktion) ---------- */
  function calcTotals(cart, codeId, shippingId) {
    const lines = cart.map((item) => {
      const p = byId.get(item.productId);
      const v = getVariant(p, item.variantId);
      const unit = item.sub ? round2(v.price * (1 - SHOP.subscriptionDiscount)) : v.price;
      return { ...item, p, v, unit, list: v.price, total: round2(unit * item.qty) };
    });
    const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));

    // 3 för 2: billigaste av varje påbörjad trio av kampanjvaror är gratis (ej prenumerationer)
    const campaignUnits = [];
    lines.forEach((l) => { if (l.p.campaign === "3for2" && !l.sub) for (let i = 0; i < l.qty; i++) campaignUnits.push(l.unit); });
    campaignUnits.sort((a, b) => b - a);
    let campaign = 0;
    for (let i = 2; i < campaignUnits.length; i += 3) campaign += campaignUnits[i];
    campaign = round2(campaign);
    const afterCampaign = round2(subtotal - campaign);

    let codeDiscount = 0;
    let codeError = null;
    let freeShipByCode = false;
    const code = codeId ? SHOP.discountCodes[codeId] : null;
    if (codeId && !code) codeError = "Koden finns inte eller har gått ut.";
    else if (code) {
      if (code.minTotal && afterCampaign < code.minTotal) codeError = `Koden gäller vid köp över ${money(code.minTotal)}. Lägg till ${money(code.minTotal - afterCampaign)} till.`;
      else if (code.type === "percent") codeDiscount = round2(afterCampaign * code.value);
      else if (code.type === "category") {
        const base = lines.filter((l) => code.categories.includes(l.p.cat)).reduce((s, l) => s + l.total, 0);
        if (base === 0) codeError = "Koden gäller bara protein och träningsprodukter.";
        codeDiscount = round2(base * code.value);
      } else if (code.type === "freeship") freeShipByCode = true;
    }

    const merchandise = round2(afterCampaign - codeDiscount);
    const method = SHOP.shipping.find((s) => s.id === shippingId) || SHOP.shipping[0];
    const shippingFree = lines.length === 0 || (method.freeOver != null && merchandise >= method.freeOver) || (freeShipByCode && method.id !== "express");
    const shipping = shippingFree ? 0 : method.price;
    const total = round2(merchandise + shipping);
    const vat = round2(total - total / (1 + SHOP.vatRate));
    const listTotal = round2(lines.reduce((s, l) => s + l.list * l.qty, 0));
    const subSavings = round2(listTotal - subtotal);
    return {
      lines, subtotal, campaign, codeDiscount, codeError, codeValid: !!code && !codeError, freeShipByCode,
      merchandise, shipping, shippingFree, method, total, vat, subSavings,
      freeLeft: round2(Math.max(0, SHOP.freeShippingThreshold - merchandise)),
      freePct: Math.min(100, (merchandise / SHOP.freeShippingThreshold) * 100),
      count: lines.reduce((n, l) => n + l.qty, 0)
    };
  }
  const totals = (shippingId) => calcTotals(state.cart, state.code, shippingId);

  function applyCode(raw) {
    const id = String(raw || "").trim().toUpperCase().replace(/\s+/g, "").replace(/Ä/g, "A").replace(/Å/g, "A").replace(/Ö/g, "O");
    if (!id) return { ok: false, msg: "Skriv in en rabattkod." };
    if (!SHOP.discountCodes[id]) return { ok: false, msg: `Koden ”${raw.trim()}” finns inte eller har gått ut.` };
    state.code = id;
    commit("code");
    const t = totals();
    if (t.codeError) return { ok: true, warn: t.codeError };
    return { ok: true, msg: `${id}: ${SHOP.discountCodes[id].label}` };
  }
  function removeCode() { state.code = null; commit("code"); }

  /* ---------- Listor ---------- */
  function toggleIn(key, id, max) {
    const list = state[key];
    const i = list.indexOf(id);
    if (i >= 0) { list.splice(i, 1); commit(key); return false; }
    if (max && list.length >= max) return null;
    list.push(id);
    commit(key);
    return true;
  }
  const toggleFavorite = (id) => toggleIn("favorites", id);
  const toggleCompare = (id) => toggleIn("compare", id, SHOP.maxCompare);
  function clearCompare() { state.compare = []; commit("compare"); }
  function pushRecent(id) {
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 12);
    commit("recent");
  }
  function addWatch(productId, email) {
    if (!state.watch.some((w) => w.productId === productId)) state.watch.push({ productId, email, date: new Date().toISOString() });
    commit("watch");
  }
  function addReview(productId, review) {
    (state.reviews[productId] = state.reviews[productId] || []).unshift(review);
    commit("reviews");
  }
  function saveProfile(profile) { state.profile = { ...state.profile, ...profile }; commit("profile"); }
  function toggleSubPause(key) { state.subsPaused[key] = !state.subsPaused[key]; commit("subsPaused"); }

  /* ---------- Ordrar ---------- */
  function addBusinessDays(date, days) {
    const d = new Date(date);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const wd = d.getDay();
      if (wd !== 0 && wd !== 6) added++;
    }
    return d;
  }
  function shipDate(now = new Date()) {
    const wd = now.getDay();
    const beforeCutoff = now.getHours() < SHOP.cutoffHour;
    if (wd !== 0 && wd !== 6 && beforeCutoff) return new Date(now);
    return addBusinessDays(now, 1);
  }
  function deliveryWindow(method, now = new Date()) {
    const ship = shipDate(now);
    return [addBusinessDays(ship, method.days[0]), addBusinessDays(ship, method.days[1])];
  }

  function placeOrder({ customer, shippingId, paymentId }) {
    const t = totals(shippingId);
    const id = "SU-" + String(Date.now()).slice(-7);
    const [from, to] = deliveryWindow(t.method);
    const order = {
      id, date: new Date().toISOString(), status: "Mottagen",
      items: t.lines.map((l) => ({ productId: l.p.id, name: l.p.name, variantId: l.v.id, variant: l.v.label, flavor: l.flavor, qty: l.qty, unit: l.unit, total: l.total, sub: l.sub })),
      totals: { subtotal: t.subtotal, campaign: t.campaign, codeDiscount: t.codeDiscount, code: t.codeValid ? state.code : null, shipping: t.shipping, total: t.total, vat: t.vat },
      shipping: { id: t.method.id, name: t.method.name, carrier: t.method.carrier, from: from.toISOString(), to: to.toISOString() },
      payment: SHOP.payments.find((p) => p.id === paymentId).name,
      customer
    };
    state.orders.unshift(order);
    // Minska lagersaldo lokalt så att "Få kvar" uppdateras
    t.lines.forEach((l) => { l.p.stock = Math.max(0, l.p.stock - l.qty); });
    state.cart = [];
    state.code = null;
    commit("orders", "cart", "code");
    return order;
  }

  window.Store = {
    SHOP, products, categories, goals, brands, diets, forms, RI,
    byId, bySlug, catById, goalById, brandById, dietById,
    getVariant, isNew, lowestPrice, onSale, stockState, unitPrices, nutritionRows,
    money, money2, num, round2, norm, search, rng,
    state, subscribe, commit, storage,
    addToCart, setQty, removeLine, restoreLine, clearCart, cartCount, calcTotals, totals, applyCode, removeCode,
    toggleFavorite, toggleCompare, clearCompare, pushRecent, addWatch, addReview, saveProfile, toggleSubPause,
    placeOrder, shipDate, deliveryWindow, addBusinessDays
  };
})();
