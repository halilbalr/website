/* Router, händelser och uppstart. */
(function () {
  const S = window.Store;
  const U = window.UI;
  const V = window.Views;
  const { SHOP } = S;
  const { $, $$, esc, icon, toast } = U;
  const main = $("#main");

  /* ---------- Betalning ----------
     Demo: godkänner alltid. Koppla en riktig betalleverantör (t.ex. Stripe, Klarna eller
     Swish Handel) via en egen server – kortuppgifter ska aldrig hanteras i den här koden. */
  const Payments = {
    authorize(method) {
      const delay = method === "swish" ? 2200 : 1400;
      return new Promise((resolve) => setTimeout(() => resolve({ ok: true, ref: "DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase() }), delay));
    }
  };

  /* ---------- Router ---------- */
  const ROUTES = {
    "": V.home,
    produkter: V.listing, kategori: V.listing, mal: V.listing, varumarke: V.listing, kampanjer: V.listing, nyheter: V.listing, sok: V.listing,
    varumarken: V.brands,
    produkt: V.product,
    varukorg: V.cart,
    kassa: V.checkout,
    order: V.order,
    konto: V.account,
    favoriter: V.favorites,
    jamfor: V.compare,
    guide: V.quiz,
    info: V.info
  };

  function parsePath(path) {
    const [p, qs] = String(path || "/").split("?");
    const parts = p.split("/").filter(Boolean).map((x) => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    const query = {};
    if (qs) new URLSearchParams(qs).forEach((v, k) => { query[k] = v; });
    return { path: "/" + parts.join("/"), parts, query, raw: path };
  }
  function hashPath() {
    const h = location.hash || "";
    if (h.startsWith("#/")) return h.slice(1);
    const token = h.slice(1);
    if (token && ROUTES[token] && !document.getElementById(token)) return "/" + token;
    return "/";
  }

  let route = parsePath(hashPath());
  let firstRender = true;

  function navigate(path, opts = {}) {
    route = parsePath(path);
    try {
      if (location.hash !== "#" + path) history[opts.replace ? "replaceState" : "pushState"](null, "", "#" + path);
    } catch (e) { /* sandlådor utan history */ }
    render(opts);
  }

  function titleFor(r) {
    const k = r.parts[0] || "";
    if (!k) return `${SHOP.name} – ${SHOP.tagline}`;
    let t = "";
    if (ROUTES[k] === V.listing) { const ctx = V.listingContext(r); t = ctx ? ctx.title : "Sidan finns inte"; }
    else if (k === "produkt") { const p = S.bySlug.get(r.parts[1]); t = p ? p.name : "Sidan finns inte"; }
    else if (k === "info") t = V.infoTitle(r.parts[1] || "kundservice");
    else t = { varumarken: "Varumärken", varukorg: "Varukorg", kassa: "Kassa", order: "Orderbekräftelse", konto: "Mina sidor", favoriter: "Favoriter", jamfor: "Jämför", guide: "Tillskottsguide" }[k] || "Sidan finns inte";
    return `${t} | ${SHOP.name}`;
  }

  let stickyObserver = null;
  function render(opts = {}) {
    U.closeDrawers(false);
    hideSuggest();
    if (stickyObserver) { stickyObserver.disconnect(); stickyObserver = null; }
    const key = route.parts[0] || "";
    const view = ROUTES[key] || (() => V.notFound());
    main.innerHTML = view(route);
    document.title = titleFor(route);
    $$("#catnav a").forEach((a) => {
      const on = a.dataset.nav === route.path || (route.parts[0] === "produkt" && a.dataset.nav === "/kategori/" + ((S.bySlug.get(route.parts[1]) || {}).cat));
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    afterRender(key);
    updateCompareBar();
    if (opts.scroll !== false) window.scrollTo(0, 0);
    if (!firstRender && opts.focus !== false) main.focus({ preventScroll: true });
    firstRender = false;
  }

  function afterRender(key) {
    if (key === "produkt") {
      const p = S.bySlug.get(route.parts[1]);
      if (p) S.pushRecent(p.id);
      observeSticky();
    }
  }

  function observeSticky() {
    const bar = $("#sticky-buy");
    const target = $("#pdp-add");
    if (!bar || !target || !("IntersectionObserver" in window)) return;
    if (stickyObserver) stickyObserver.disconnect();
    stickyObserver = new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", String(!show));
      const btn = bar.querySelector("button");
      if (btn) btn.tabIndex = show ? 0 : -1;
    });
    stickyObserver.observe(target);
  }

  window.addEventListener("popstate", () => {
    const next = hashPath();
    if (next === route.raw) return;
    route = parsePath(next);
    render();
  });
  window.addEventListener("hashchange", () => {
    const next = hashPath();
    if (next === route.raw || (!location.hash.startsWith("#/") && next === "/")) return;
    route = parsePath(next);
    render();
  });

  /* ---------- Fokus vid omritning ---------- */
  function focusSig() {
    const a = document.activeElement;
    if (!a || a === document.body || a === main) return null;
    if (a.id) return "#" + CSS.escape(a.id);
    const sel = ["data-action", "data-key", "data-delta", "data-id", "data-value"].filter((n) => a.hasAttribute(n)).map((n) => `[${n}="${CSS.escape(a.getAttribute(n))}"]`).join("");
    return sel ? a.tagName.toLowerCase() + sel : null;
  }
  function restoreFocus(sig) {
    if (!sig) return;
    const el = document.querySelector(sig);
    if (el && !el.disabled) el.focus({ preventScroll: true });
  }

  /* ---------- Header-räknare, varukorgslåda, jämförelse ---------- */
  let lastCount = S.cartCount();
  function updateBadges() {
    const n = S.cartCount();
    const c = $("#cart-count");
    c.textContent = n;
    c.hidden = n === 0;
    if (n > lastCount) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    lastCount = n;
    $("#cart-open").setAttribute("aria-label", n ? `Öppna varukorgen, ${n} varor` : "Öppna varukorgen");
    const f = $("#fav-count");
    f.textContent = S.state.favorites.length;
    f.hidden = !S.state.favorites.length;
  }
  function refreshCartDrawer() {
    const sig = $("#cart-drawer").contains(document.activeElement) ? focusSig() : null;
    $("#cart-drawer-body").innerHTML = V.cartDrawer();
    restoreFocus(sig);
  }
  function openCart(trigger) {
    refreshCartDrawer();
    U.openDrawer($("#cart-drawer"), trigger || $("#cart-open"));
  }
  function updateCompareBar() {
    const bar = $("#compare-bar");
    const list = S.state.compare.map((id) => S.byId.get(id)).filter(Boolean);
    if (!list.length || route.parts[0] === "jamfor" || route.parts[0] === "kassa") { bar.hidden = true; return; }
    bar.hidden = false;
    bar.innerHTML = `<div class="compare-bar__thumbs" aria-hidden="true">${list.map((p) => `<span style="--c:${U.catColor(p)}">${U.packshot(p)}</span>`).join("")}</div>
      <a class="btn btn--accent btn--sm" href="#/jamfor">${icon("compare", "ico--sm")} Jämför (${list.length})</a>
      <button class="btn btn--ghost btn--sm" type="button" data-action="compare-clear">Rensa</button>`;
  }
  function syncToggles(id) {
    const fav = S.state.favorites.includes(id);
    $$(`[data-action="fav"][data-id="${id}"]`).forEach((b) => {
      b.setAttribute("aria-pressed", String(fav));
      b.innerHTML = icon(fav ? "heart-fill" : "heart");
      const name = (S.byId.get(id) || {}).name || "";
      b.setAttribute("aria-label", `${fav ? "Ta bort från favoriter" : "Spara som favorit"}: ${name}`);
    });
    const cmp = S.state.compare.includes(id);
    $$(`input[data-action="compare"][data-id="${id}"]`).forEach((i) => { i.checked = cmp; });
  }

  S.subscribe((keys) => {
    updateBadges();
    const k = route.parts[0] || "";
    if (keys.includes("cart") || keys.includes("code")) {
      refreshCartDrawer();
      if (k === "varukorg") { const sig = focusSig(); main.innerHTML = V.cart(); restoreFocus(sig); }
      if (k === "kassa") updateCheckout();
    }
    if (keys.includes("compare")) {
      updateCompareBar();
      if (k === "jamfor") render({ scroll: false, focus: false });
    }
    if (keys.includes("favorites") && (k === "favoriter" || (k === "konto" && route.parts[1] === "favoriter"))) render({ scroll: false, focus: false });
  });

  /* ---------- Produktsida ---------- */
  function refreshBuyBox() {
    const p = S.byId.get(V.pdpState.id);
    const box = $("#pdp-buy");
    if (!p || !box) return;
    const sig = focusSig();
    box.innerHTML = V.buyBox(p);
    restoreFocus(sig);
    observeSticky();
  }
  function refreshReviews() {
    const p = S.byId.get(V.pdpState.id);
    if (p && $("#reviews-body")) $("#reviews-body").innerHTML = V.reviewsHtml(p);
  }
  function addAndOpen(opts, trigger, quiet) {
    const p = S.byId.get(opts.productId);
    const before = S.state.cart.find((i) => i.productId === opts.productId && i.variantId === (opts.variantId || p.variants[0].id));
    const beforeQty = before ? before.qty : 0;
    const res = S.addToCart(opts);
    if (!res) { toast(`${esc(p.name)} är tyvärr slut i lager.`, { icon: "x" }); return false; }
    const line = S.state.cart.find((i) => i.productId === p.id && i.variantId === res.v.id);
    if (line && before && line.qty === beforeQty) toast(`Max ${line.qty} st av ${esc(p.name)} per order.`, { icon: "x" });
    else if (quiet) toast(`<strong>${esc(p.name)}</strong> ligger i varukorgen`, { action: { label: "Visa", fn: () => openCart() } });
    if (!quiet) openCart(trigger);
    return true;
  }

  /* ---------- Sökförslag ---------- */
  const searchInput = $("#search-input");
  const suggest = $("#search-suggest");
  let suggestSel = -1;
  function hideSuggest() {
    suggest.hidden = true;
    suggestSel = -1;
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
  }
  function highlight(text, q) {
    let out = esc(text);
    q.split(/\s+/).filter((t) => t.length > 1).forEach((t) => {
      const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }
  function renderSuggest() {
    const q = searchInput.value.trim();
    if (q.length < 2) { hideSuggest(); return; }
    const all = S.search(q);
    const nq = S.norm(q);
    const cats = S.categories.filter((c) => S.norm(c.name).includes(nq)).slice(0, 3);
    const goals = S.goals.filter((g) => S.norm(g.name).includes(nq)).slice(0, 2);
    let i = 0;
    const opt = (href, inner) => `<a class="suggest__item" role="option" id="sg-${i++}" href="${href}" aria-selected="false">${inner}</a>`;
    let html = "";
    if (cats.length || goals.length) {
      html += `<div class="suggest__group">Kategorier & mål</div>` + cats.map((c) => opt(`#/kategori/${c.id}`, `${icon("chevron", "ico--sm")}<span>${highlight(c.name, q)}</span>`)).join("")
        + goals.map((g) => opt(`#/mal/${g.id}`, `${icon("chevron", "ico--sm")}<span>${highlight(g.name, q)}</span>`)).join("");
    }
    if (all.length) {
      html += `<div class="suggest__group">Produkter</div>` + all.slice(0, 6).map((p) => opt(`#/produkt/${p.slug}`,
        `<span class="suggest__thumb" style="background:color-mix(in srgb,${U.catColor(p)} 14%,var(--surface))">${U.packshot(p, 'aria-hidden="true"')}</span>
         <span style="min-width:0"><span style="display:block;font-weight:600">${highlight(p.name, q)}</span><span class="muted" style="font-size:12px">${esc(S.brandById.get(p.brand).name)} · ${esc(p.variants[0].label)}</span></span>
         <span class="suggest__price num">${S.money(S.lowestPrice(p))}</span>`)).join("");
      html += opt(`#/sok?q=${encodeURIComponent(q)}`, `${icon("search", "ico--sm")}<span>Visa alla ${all.length} träffar för ”${esc(q)}”</span>`);
    }
    if (!html) html = `<div class="suggest__empty">Inga träffar för ”${esc(q)}”. Prova till exempel magnesium, omega-3 eller protein.</div>`;
    suggest.innerHTML = html;
    suggest.hidden = false;
    suggestSel = -1;
    searchInput.setAttribute("aria-expanded", "true");
  }
  function moveSuggest(dir) {
    const opts = $$('[role="option"]', suggest);
    if (!opts.length) return;
    suggestSel = (suggestSel + dir + opts.length) % opts.length;
    opts.forEach((o, i) => o.setAttribute("aria-selected", String(i === suggestSel)));
    searchInput.setAttribute("aria-activedescendant", opts[suggestSel].id);
    opts[suggestSel].scrollIntoView({ block: "nearest" });
  }
  searchInput.addEventListener("input", renderSuggest);
  searchInput.addEventListener("focus", () => { if (searchInput.value.trim().length >= 2) renderSuggest(); });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (suggest.hidden) renderSuggest(); moveSuggest(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSuggest(-1); }
    else if (e.key === "Escape") { hideSuggest(); }
    else if (e.key === "Enter" && suggestSel >= 0) {
      e.preventDefault();
      const opt = $$('[role="option"]', suggest)[suggestSel];
      if (opt) { searchInput.blur(); navigate(opt.getAttribute("href").slice(1)); }
    }
  });

  /* ---------- Tema ---------- */
  const root = document.documentElement;
  const darkMq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : { matches: false };
  const effectiveTheme = () => root.getAttribute("data-theme") || (darkMq.matches ? "dark" : "light");
  function updateThemeBtn() {
    const dark = effectiveTheme() === "dark";
    const b = $("#theme-toggle");
    b.innerHTML = icon(dark ? "sun" : "moon");
    b.setAttribute("aria-label", dark ? "Byt till ljust tema" : "Byt till mörkt tema");
  }
  function applyTheme(t) {
    if (t) root.setAttribute("data-theme", t); else root.removeAttribute("data-theme");
    updateThemeBtn();
  }
  if (darkMq.addEventListener) darkMq.addEventListener("change", updateThemeBtn);

  /* ---------- Cookies ---------- */
  function showCookie(settings) {
    const c = S.storage.get("cookies", null) || { stats: false, marketing: false };
    const el = $("#cookie");
    el.innerHTML = `<h2>Vi använder cookies</h2>
      <p>Nödvändiga cookies behövs för varukorg och kassa. Med ditt godkännande använder vi även cookies för statistik och anpassade erbjudanden. <a class="link" href="#/info/integritet">Läs mer</a></p>
      ${settings ? `<div style="display:grid;gap:8px">
        <label class="check"><input type="checkbox" checked disabled> <span><strong>Nödvändiga</strong> – varukorg, kassa och dina val</span></label>
        <label class="check"><input type="checkbox" id="ck-stats" ${c.stats ? "checked" : ""}> <span><strong>Statistik</strong> – hjälper oss förbättra butiken</span></label>
        <label class="check"><input type="checkbox" id="ck-marketing" ${c.marketing ? "checked" : ""}> <span><strong>Marknadsföring</strong> – relevanta erbjudanden</span></label>
      </div>` : ""}
      <div class="cookie__btns">
        ${settings ? `<button class="btn btn--primary btn--sm" type="button" data-action="cookie-save">Spara val</button>` : `<button class="btn btn--ghost btn--sm" type="button" data-action="cookie-settings">Anpassa</button>`}
        <button class="btn btn--ghost btn--sm" type="button" data-action="cookie-necessary">Endast nödvändiga</button>
        <button class="btn btn--primary btn--sm" type="button" data-action="cookie-accept">Godkänn alla</button>
      </div>`;
    el.hidden = false;
  }
  function saveCookies(stats, marketing) {
    S.storage.set("cookies", { stats, marketing, date: new Date().toISOString() });
    $("#cookie").hidden = true;
    toast("Dina cookieval är sparade.");
  }

  /* ---------- Formulärhjälp ---------- */
  const val = (id) => (($("#" + id) || {}).value || "").trim();
  function setError(id, msg) {
    const input = $("#" + id);
    const err = $("#" + id + "-err");
    const field = input && input.closest(".field");
    if (field) field.classList.toggle("has-error", !!msg);
    if (input) { if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
    if (err) { err.textContent = msg || ""; err.hidden = !msg; }
  }
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const mobileOk = (s) => /^(?:\+46|0046|0)7\d{8}$/.test(s.replace(/[\s-]/g, ""));
  function luhn(num) {
    let sum = 0;
    let dbl = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = +num[i];
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  /* ---------- Kassa ---------- */
  const CO = V.checkoutState;
  function updateCheckout() {
    const t = S.totals(CO.ship);
    if (!t.lines.length) { render({ scroll: false }); return; }
    const sig = $("#co-summary") && $("#co-summary").contains(document.activeElement) ? focusSig() : null;
    $("#co-summary").innerHTML = V.checkoutSummary();
    restoreFocus(sig);
    const checked = $('input[name="ship"]:checked');
    const shipSig = checked && document.activeElement === checked;
    $("#co-shipping").innerHTML = V.shippingChoices();
    if (shipSig) $(`input[name="ship"][value="${CO.ship}"]`).focus();
    $("#co-submit-label").textContent = `Slutför köp – ${S.money(t.total).replace(" ", " ")}`;
    const d = $("#delbetala-amount");
    if (d) d.textContent = `3 × ${S.money(Math.ceil(t.total / 3))}`;
  }

  function validateCheckout() {
    const errors = [];
    const check = (id, ok, msg) => { setError(id, ok ? "" : msg); if (!ok) errors.push([id, msg]); };
    check("co-email", EMAIL.test(val("co-email")), "Ange en giltig e-postadress, till exempel namn@exempel.se.");
    check("co-phone", mobileOk(val("co-phone")), "Ange ett svenskt mobilnummer, till exempel 070-123 45 67.");
    check("co-first", !!val("co-first"), "Fyll i förnamn.");
    check("co-last", !!val("co-last"), "Fyll i efternamn.");
    check("co-street", val("co-street").length > 2, "Fyll i gatuadress.");
    check("co-zip", /^\d{3}\s?\d{2}$/.test(val("co-zip")), "Postnumret ska ha fem siffror, till exempel 123 45.");
    check("co-city", !!val("co-city"), "Fyll i ort.");
    if (CO.pay === "kort") {
      const num = val("cc-number").replace(/\D/g, "");
      check("cc-number", num.length >= 13 && num.length <= 19 && luhn(num), "Kortnumret stämmer inte. Kontrollera siffrorna.");
      const m = val("cc-exp").match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
      let expOk = !!m;
      if (m) {
        const end = new Date(2000 + +m[2], +m[1], 1);
        expOk = end > new Date();
      }
      check("cc-exp", expOk, m ? "Kortet har gått ut." : "Ange datum som MM/ÅÅ, till exempel 08/28.");
      check("cc-cvc", /^\d{3,4}$/.test(val("cc-cvc")), "CVC är tre eller fyra siffror på kortets baksida.");
      check("cc-name", !!val("cc-name"), "Fyll i namnet som står på kortet.");
    }
    if (CO.pay === "swish") check("sw-phone", mobileOk(val("sw-phone")), "Ange mobilnumret som är kopplat till Swish.");
    check("co-terms", $("#co-terms").checked, "Du behöver godkänna köpvillkoren för att slutföra köpet.");
    const box = $("#co-errors");
    if (errors.length) {
      box.innerHTML = `<strong>${errors.length === 1 ? "En uppgift behöver rättas" : `${errors.length} uppgifter behöver rättas`}:</strong><ul style="margin:6px 0 0;padding-left:1.2em">${errors.map(([id, msg]) => `<li><a href="#${id}" data-action="focus-field" data-target="${id}" style="color:inherit">${esc(msg)}</a></li>`).join("")}</ul>`;
      box.hidden = false;
      const first = $("#" + errors[0][0]);
      first.focus({ preventScroll: true });
      first.scrollIntoView({ behavior: "smooth", block: "center" });
    } else box.hidden = true;
    return !errors.length;
  }

  let processing = false;
  async function submitCheckout() {
    if (processing) return;
    if (!S.state.cart.length) { render(); return; }
    if (!validateCheckout()) return;
    processing = true;
    const btn = $("#co-submit");
    btn.disabled = true;
    const overlay = document.createElement("div");
    overlay.className = "processing";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-live", "assertive");
    overlay.setAttribute("aria-label", "Behandlar betalningen");
    overlay.innerHTML = `<div class="processing__box"><div class="spinner" aria-hidden="true"></div><h2 style="font-size:var(--step-2)">${CO.pay === "swish" ? "Öppna Swish och godkänn betalningen" : "Behandlar betalningen…"}</h2><p class="muted">${CO.pay === "swish" ? `Betalningsförfrågan skickas till ${esc(val("sw-phone"))}.` : "Stäng inte fönstret."}${SHOP.demo ? " (Simulerat i demobutiken.)" : ""}</p></div>`;
    document.body.appendChild(overlay);
    const customer = { email: val("co-email"), phone: val("co-phone"), first: val("co-first"), last: val("co-last"), street: val("co-street"), co: val("co-co"), zip: val("co-zip").replace(/^(\d{3})\s?(\d{2})$/, "$1 $2"), city: val("co-city") };
    const save = $("#co-save").checked;
    const news = $("#co-news").checked;
    try {
      const res = await Payments.authorize(CO.pay);
      if (!res.ok) throw new Error("declined");
      const order = S.placeOrder({ customer, shippingId: CO.ship, paymentId: CO.pay });
      order.paymentRef = res.ref;
      S.commit("orders");
      if (save) S.saveProfile({ ...customer, news });
      CO.draft = null;
      overlay.remove();
      navigate("/order/" + order.id);
      toast("Tack! Beställningen är mottagen.");
    } catch (e) {
      overlay.remove();
      btn.disabled = false;
      toast("Betalningen gick inte igenom. Kontrollera uppgifterna eller välj ett annat betalsätt.", { icon: "x", duration: 6000 });
    } finally {
      processing = false;
    }
  }

  /* ---------- Klick ---------- */
  function onAction(el, e) {
    const a = el.dataset.action;
    const id = el.dataset.id;
    const L = V.listingState;
    const PD = V.pdpState;
    const Q = V.quizState;
    switch (a) {
      case "add": {
        const quiet = !!el.closest("#cart-drawer, .quiz, .compare-table");
        addAndOpen({ productId: id }, el, quiet);
        return true;
      }
      case "fav": {
        const on = S.toggleFavorite(id);
        syncToggles(id);
        toast(on ? `<strong>${esc(S.byId.get(id).name)}</strong> sparad i favoriter` : "Borttagen från favoriter", { icon: "heart", action: on ? { label: "Visa", fn: () => navigate("/favoriter") } : null });
        return true;
      }
      case "compare": {
        const r = S.toggleCompare(id);
        if (r === null) toast(`Du kan jämföra högst ${SHOP.maxCompare} produkter.`, { icon: "x" });
        syncToggles(id);
        return true;
      }
      case "compare-clear": S.clearCompare(); $$('input[data-action="compare"]').forEach((i) => { i.checked = false; }); return true;
      case "rail": {
        const r = document.getElementById(el.dataset.target);
        if (r) r.scrollBy({ left: +el.dataset.dir * r.clientWidth * 0.85, behavior: "smooth" });
        return true;
      }
      case "qty": {
        const item = S.state.cart.find((i) => i.key === el.dataset.key);
        if (item) S.setQty(item.key, item.qty + +el.dataset.delta);
        return true;
      }
      case "remove": {
        const removed = S.removeLine(el.dataset.key);
        if (removed) toast(`<strong>${esc(S.byId.get(removed.item.productId).name)}</strong> togs bort`, { icon: "trash", action: { label: "Ångra", fn: () => S.restoreLine(removed) } });
        return true;
      }
      case "apply-code": applyCode(); return true;
      case "remove-code": S.removeCode(); toast("Rabattkoden är borttagen."); return true;
      case "close-drawers": U.closeDrawers(false); return false;
      case "filters-open": {
        const f = $("#filters");
        f.classList.add("is-open");
        $("#overlay").hidden = false;
        document.body.style.overflow = "hidden";
        el.setAttribute("aria-expanded", "true");
        const first = f.querySelector("input, button");
        if (first) first.focus();
        return true;
      }
      case "filters-close": U.closeDrawers(); return true;
      case "unfilter": {
        const k = el.dataset.facet;
        if (k === "price") V.setFilter("price", null);
        else if (k === "rating") V.setFilter("rating", 0);
        else if (k === "stock" || k === "sale") V.setFilter(k, null, false);
        else V.setFilter(k, el.dataset.value, false);
        V.updateListing();
        const next = $("#chips button");
        (next || main).focus({ preventScroll: true });
        return true;
      }
      case "clear-filters": V.clearFilters(); V.updateListing(); main.focus({ preventScroll: true }); return true;
      case "load-more": {
        const before = $$("#results .card").length;
        L.shown += SHOP.pageSize;
        V.updateListing({ filters: false });
        const nextCard = $$("#results .card")[before];
        if (nextCard) nextCard.querySelector(".card__name").focus({ preventScroll: true });
        return true;
      }
      case "view-mode":
        L.view = el.dataset.mode;
        S.storage.set("view", L.view);
        $$('[data-action="view-mode"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === L.view)));
        V.updateListing({ filters: false });
        return true;
      case "pdp-variant": {
        PD.variantId = el.dataset.variant;
        refreshBuyBox();
        return true;
      }
      case "pdp-flavor": PD.flavor = el.dataset.flavor; refreshBuyBox(); return true;
      case "pdp-qty": {
        const p = S.byId.get(PD.id);
        PD.qty = Math.max(1, Math.min(Math.min(20, p.stock), PD.qty + +el.dataset.delta));
        refreshBuyBox();
        return true;
      }
      case "pdp-add":
      case "pdp-buy-now": {
        const ok = addAndOpen({ productId: PD.id, variantId: PD.variantId, flavor: PD.flavor, qty: PD.qty, sub: PD.sub }, el, a === "pdp-buy-now");
        if (ok && a === "pdp-buy-now") navigate("/kassa");
        return true;
      }
      case "pdp-view": {
        PD.view = el.dataset.view;
        const p = S.byId.get(PD.id);
        $("#gallery-main").innerHTML = PD.view === "dose" ? U.doseArt(p) : U.packshot(p);
        $$('[data-action="pdp-view"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === PD.view)));
        return true;
      }
      case "scroll-to":
      case "focus-field": {
        e.preventDefault();
        const t = document.getElementById(el.dataset.target);
        if (t) { t.scrollIntoView({ behavior: "smooth", block: a === "focus-field" ? "center" : "start" }); t.focus({ preventScroll: true }); }
        return true;
      }
      case "review-toggle": {
        PD.reviewForm = !PD.reviewForm;
        refreshReviews();
        if (PD.reviewForm) $("#rv-s5").focus(); else $('[data-action="review-toggle"]').focus();
        return true;
      }
      case "fbt-add": {
        const ids = $$('[data-action="fbt-toggle"]:checked').map((i) => i.dataset.id);
        if (!ids.length) { toast("Välj minst en produkt.", { icon: "x" }); return true; }
        ids.forEach((pid) => S.addToCart({ productId: pid }));
        openCart(el);
        return true;
      }
      case "copy-code": {
        const code = el.dataset.code;
        const done = () => toast(`Koden <strong class="mono">${esc(code)}</strong> är kopierad.`);
        try {
          navigator.clipboard.writeText(code).then(done, () => toast(`Din kod: <strong class="mono">${esc(code)}</strong>`, { icon: "tag" }));
        } catch (err) { toast(`Din kod: <strong class="mono">${esc(code)}</strong>`, { icon: "tag" }); }
        return true;
      }
      case "cookie-settings": showCookie(true); $("#ck-stats").focus(); return true;
      case "cookie-accept": saveCookies(true, true); return true;
      case "cookie-necessary": saveCookies(false, false); return true;
      case "cookie-save": saveCookies($("#ck-stats").checked, $("#ck-marketing").checked); return true;
      case "nav": navigate(el.dataset.href.slice(1)); return true;
      case "reorder": {
        const o = S.state.orders.find((x) => x.id === id);
        if (!o) return true;
        let missing = 0;
        o.items.forEach((it) => { if (!S.addToCart({ productId: it.productId, variantId: it.variantId, flavor: it.flavor, qty: it.qty, sub: it.sub })) missing++; });
        if (missing) toast(`${missing} produkt${missing > 1 ? "er" : ""} är slut i lager och lades inte till.`, { icon: "x" });
        openCart(el);
        return true;
      }
      case "sub-pause": {
        S.toggleSubPause(el.dataset.key);
        render({ scroll: false, focus: false });
        restoreFocus(`[data-action="sub-pause"][data-key="${CSS.escape(el.dataset.key)}"]`);
        toast(S.state.subsPaused[el.dataset.key] ? "Prenumerationen är pausad." : "Prenumerationen är återupptagen.");
        return true;
      }
      case "add-all-favs": {
        S.state.favorites.forEach((pid) => S.addToCart({ productId: pid }));
        openCart(el);
        return true;
      }
      case "quiz-pick": {
        const q = V.quizQuestions[Q.step];
        const v = el.dataset.value;
        if (q.multi) {
          const i = Q.goals.indexOf(v);
          if (i >= 0) Q.goals.splice(i, 1);
          else if (Q.goals.length < q.multi) Q.goals.push(v);
          else { toast(`Välj högst ${q.multi}.`, { icon: "x" }); return true; }
        } else Q[q.key] = v;
        render({ scroll: false, focus: false });
        restoreFocus("#quiz-" + CSS.escape(v));
        return true;
      }
      case "quiz-next": Q.step++; render({ scroll: false }); return true;
      case "quiz-back": Q.step = Math.max(0, Q.step - 1); render({ scroll: false }); return true;
      case "quiz-restart": Object.assign(Q, { step: 0, goals: [], diet: "", form: "", budget: "" }); render({ scroll: false }); return true;
      case "quiz-add-all": {
        V.recommend().forEach((r) => S.addToCart({ productId: r.p.id }));
        openCart(el);
        return true;
      }
      default: return false;
    }
  }

  function applyCode() {
    const input = $("#code-input");
    if (!input) return;
    const res = S.applyCode(input.value);
    if (!res.ok) {
      const msg = $("#code-msg");
      msg.textContent = res.msg;
      msg.classList.add("is-error");
      input.closest(".field").classList.add("has-error");
      input.focus();
      return;
    }
    toast(res.warn ? esc(res.warn) : `Rabattkoden är tillagd – ${esc(res.msg)}`, { icon: "tag", duration: res.warn ? 6000 : 4200 });
    const rm = $('[data-action="remove-code"]');
    if (rm) rm.focus();
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("#theme-toggle")) {
      const next = effectiveTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      S.storage.set("theme", next);
      return;
    }
    if (t.closest("#cart-open")) { openCart(t.closest("#cart-open")); return; }
    if (t.closest("#menu-open")) { U.openDrawer($("#mobile-menu"), t.closest("#menu-open")); return; }
    if (t.closest("[data-close-drawer]") || t.id === "overlay") { U.closeDrawers(); return; }
    if (!t.closest(".search")) hideSuggest();

    const actEl = t.closest("[data-action]");
    if (actEl && actEl.tagName !== "INPUT" && actEl.tagName !== "SELECT" && !actEl.disabled) {
      if (onAction(actEl, e)) { e.preventDefault(); return; }
    }
    const link = t.closest("a[href]");
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = link.getAttribute("href");
    if (href.startsWith("#/")) {
      e.preventDefault();
      if (link.closest("#search-suggest")) { searchInput.value = ""; searchInput.blur(); }
      navigate(href.slice(1));
    } else if (href.length > 1 && href.startsWith("#")) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }
  });

  /* ---------- Ändringar ---------- */
  document.addEventListener("change", (e) => {
    const t = e.target;
    const PD = V.pdpState;
    if (t.dataset.filter) {
      const k = t.dataset.filter;
      if (k === "price") V.setFilter("price", +t.value >= +t.max ? null : +t.value);
      else if (k === "rating") V.setFilter("rating", +t.value);
      else if (k === "stock" || k === "sale") V.setFilter(k, null, t.checked);
      else V.setFilter(k, t.value, t.checked);
      V.updateListing();
      return;
    }
    switch (t.dataset.action) {
      case "compare": {
        const r = S.toggleCompare(t.dataset.id);
        if (r === null) { t.checked = false; toast(`Du kan jämföra högst ${SHOP.maxCompare} produkter.`, { icon: "x" }); }
        syncToggles(t.dataset.id);
        break;
      }
      case "sort": V.listingState.sort = t.value; V.listingState.shown = SHOP.pageSize; V.updateListing({ filters: false }); break;
      case "pdp-buytype": PD.sub = t.value === "1" ? PD.interval : 0; refreshBuyBox(); break;
      case "pdp-interval": PD.interval = +t.value; if (PD.sub) PD.sub = PD.interval; refreshBuyBox(); break;
      case "pdp-qty-input": {
        const p = S.byId.get(PD.id);
        PD.qty = Math.max(1, Math.min(Math.min(20, p.stock), Math.round(+t.value) || 1));
        refreshBuyBox();
        break;
      }
      case "qty-input": S.setQty(t.dataset.key, +t.value); break;
      case "fbt-toggle": {
        const sum = $$('[data-action="fbt-toggle"]:checked').reduce((s, i) => s + +i.dataset.price, 0);
        $("#fbt-total").textContent = S.money(sum);
        break;
      }
      case "review-sort": PD.reviewSort = t.value; refreshReviews(); $("#review-sort").focus(); break;
      case "co-ship": CO.ship = t.value; updateCheckout(); break;
      case "co-pay":
        CO.pay = t.value;
        $$("[data-pay-extra]").forEach((x) => { x.hidden = x.dataset.payExtra !== CO.pay; });
        break;
      default:
        if (CO.draft && (t.id === "co-news" || t.id === "co-save")) CO.draft[t.id] = t.checked;
        if (t.id === "co-terms" && t.checked) setError("co-terms", "");
    }
  });

  /* ---------- Inmatning ---------- */
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "f-price") {
      const lbl = $('label[for="f-price"] strong');
      if (lbl) lbl.textContent = S.money(+t.value);
      V.setFilter("price", +t.value >= +t.max ? null : +t.value);
      V.updateListing({ filters: false });
      return;
    }
    if (t.id === "cc-number") {
      const d = t.value.replace(/\D/g, "").slice(0, 19);
      t.value = d.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (t.id === "cc-exp") {
      let d = t.value.replace(/\D/g, "").slice(0, 4);
      if (d.length >= 3) d = d.slice(0, 2) + "/" + d.slice(2);
      t.value = d;
    } else if (t.id === "co-zip") {
      const d = t.value.replace(/\D/g, "").slice(0, 5);
      t.value = d.length > 3 ? d.slice(0, 3) + " " + d.slice(3) : d;
    } else if (t.id === "cc-cvc") {
      t.value = t.value.replace(/\D/g, "").slice(0, 4);
    }
    if (CO.draft && /^(co-|sw-|cc-name)/.test(t.id) && t.type !== "checkbox") CO.draft[t.id] = t.value;
    if (t.id === "code-input") { const m = $("#code-msg"); if (m) { m.textContent = ""; m.classList.remove("is-error"); } t.closest(".field").classList.remove("has-error"); }
    const field = t.closest(".field.has-error");
    if (field && t.id) setError(t.id, "");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!suggest.hidden) { hideSuggest(); return; }
      U.closeDrawers();
    }
    if (e.key === "Enter" && e.target.id === "code-input") { e.preventDefault(); applyCode(); }
  });

  /* ---------- Formulär ---------- */
  document.addEventListener("submit", (e) => {
    const f = e.target;
    e.preventDefault();
    if (f.id === "search-form") {
      const q = searchInput.value.trim();
      if (!q) { searchInput.focus(); return; }
      searchInput.blur();
      navigate("/sok?q=" + encodeURIComponent(q));
      return;
    }
    switch (f.dataset.form) {
      case "checkout": submitCheckout(); break;
      case "newsletter": {
        const input = f.querySelector("input");
        if (!EMAIL.test(input.value.trim())) { toast("Ange en giltig e-postadress.", { icon: "x" }); input.focus(); return; }
        S.saveProfile({ email: S.state.profile.email || input.value.trim(), news: true });
        f.innerHTML = `<p style="opacity:1"><strong>Tack, du är anmäld!</strong> Använd koden <span class="promo__code" style="display:inline-block;margin-inline:4px">VALKOMMEN10</span> för 10 % på första köpet.</p>`;
        break;
      }
      case "watch": {
        const input = f.querySelector("input");
        if (!EMAIL.test(input.value.trim())) { toast("Ange en giltig e-postadress.", { icon: "x" }); input.focus(); return; }
        S.addWatch(f.dataset.id, input.value.trim());
        refreshBuyBox();
        toast("Vi meddelar dig när produkten finns i lager igen.", { icon: "check" });
        break;
      }
      case "review": {
        const stars = f.querySelector('input[name="rv-stars"]:checked');
        const errs = [];
        const chk = (id, ok) => { setError(id, ok ? "" : $("#" + id + "-err").textContent || "Fyll i fältet."); if (!ok) errs.push(id); };
        $("#rv-stars-err").hidden = !!stars;
        if (!stars) errs.push("rv-s5");
        chk("rv-name", !!val("rv-name"));
        chk("rv-title", !!val("rv-title"));
        chk("rv-text", val("rv-text").length >= 20);
        if (!stars) $("#rv-stars-err").textContent = "Välj ett betyg.";
        if (val("rv-name") === "") $("#rv-name-err").textContent = "Skriv ditt namn.";
        if (val("rv-title") === "") $("#rv-title-err").textContent = "Skriv en rubrik.";
        if (val("rv-text").length < 20) $("#rv-text-err").textContent = "Skriv minst 20 tecken.";
        if (errs.length) { $("#" + errs[0]).focus(); return; }
        S.addReview(f.dataset.id, { name: val("rv-name"), rating: +stars.value, title: val("rv-title"), body: val("rv-text"), date: new Date().toISOString(), verified: S.state.orders.some((o) => o.items.some((i) => i.productId === f.dataset.id)), helpful: 0 });
        V.pdpState.reviewForm = false;
        V.pdpState.reviewSort = "relevant";
        refreshReviews();
        toast("Tack för ditt omdöme!");
        $("#reviews").focus({ preventScroll: true });
        break;
      }
      case "profile": {
        const data = {};
        $$("input[data-key]", f).forEach((i) => { data[i.dataset.key] = i.value.trim(); });
        data.news = $("#pf-news").checked;
        if (data.email && !EMAIL.test(data.email)) { toast("E-postadressen ser inte rätt ut.", { icon: "x" }); $("#pf-email").focus(); return; }
        S.saveProfile(data);
        V.checkoutState.draft = null;
        toast("Dina uppgifter är sparade.");
        break;
      }
      case "contact": {
        let bad = null;
        const req = (id, ok, msg) => { setError(id, ok ? "" : msg); if (!ok && !bad) bad = id; };
        req("ct-name", !!val("ct-name"), "Skriv ditt namn.");
        req("ct-email", EMAIL.test(val("ct-email")), "Ange en giltig e-postadress.");
        req("ct-msg", val("ct-msg").length >= 10, "Skriv ett meddelande på minst 10 tecken.");
        if (bad) { $("#" + bad).focus(); return; }
        f.outerHTML = `<div class="panel" role="status" style="max-width:640px"><h3>Tack, ${esc(val("ct-name"))}!</h3><p>Vi svarar till ${esc(val("ct-email"))} inom en arbetsdag.${SHOP.demo ? " I demobutiken skickas inga meddelanden." : ""}</p></div>`;
        break;
      }
    }
  });

  /* ---------- Start ---------- */
  applyTheme(S.storage.get("theme", null));
  V.chrome();
  updateBadges();
  refreshCartDrawer();
  render({ scroll: false });
  if (!S.storage.get("cookies", null)) showCookie(false);
})();
