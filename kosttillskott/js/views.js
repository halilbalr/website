/* Sidvyer. Varje vy returnerar HTML; beteenden kopplas i app.js via data-action. */
(function () {
  const S = window.Store;
  const U = window.UI;
  const { SHOP } = S;
  const { esc, icon } = U;
  const V = {};

  const ALLERGENS = /\b(mjölk|mjölkprotein|helmjölkspulver|fisk|kräftdjur|krill|soja|sojaprotein|sojaproteinkrisp|havre|havremjöl|havrekli|gluten|jordnötter|nötter|ägg|sesam|selleri|senap)\b/gi;
  const bold = (s) => esc(s).replace(ALLERGENS, "<strong>$1</strong>");

  /* ---------- Header, meny & footer ---------- */
  V.navItems = () => [
    ["Alla produkter", "/produkter"],
    ...S.categories.map((c) => [c.name, "/kategori/" + c.id]),
    ["Nyheter", "/nyheter"],
    ["Kampanjer", "/kampanjer", "is-sale"],
    ["Tillskottsguide", "/guide"]
  ];

  V.chrome = function () {
    U.$("#catnav").innerHTML = V.navItems().map(([name, path, cls]) => `<li><a href="#${path}" class="${cls || ""}" data-nav="${path}">${esc(name)}</a></li>`).join("");

    U.$("#mobile-menu-body").innerHTML = `<nav class="mobile-nav" aria-label="Huvudmeny">
      <a href="#/produkter">Alla produkter ${icon("chevron", "ico--sm")}</a>
      <a href="#/kampanjer" style="color:var(--sale)">Kampanjer ${icon("chevron", "ico--sm")}</a>
      <a href="#/guide">Tillskottsguide ${icon("chevron", "ico--sm")}</a>
      <h3>Kategorier</h3>
      ${S.categories.map((c) => `<a href="#/kategori/${c.id}">${esc(c.name)} ${icon("chevron", "ico--sm")}</a>`).join("")}
      <h3>Handla efter mål</h3>
      ${S.goals.map((g) => `<a href="#/mal/${g.id}">${esc(g.name)} ${icon("chevron", "ico--sm")}</a>`).join("")}
      <h3>Konto & hjälp</h3>
      <a href="#/konto">Mina sidor ${icon("chevron", "ico--sm")}</a>
      <a href="#/favoriter">Favoriter ${icon("chevron", "ico--sm")}</a>
      <a href="#/jamfor">Jämför produkter ${icon("chevron", "ico--sm")}</a>
      <a href="#/info/kundservice">Kundservice ${icon("chevron", "ico--sm")}</a>
      <a href="#/info/frakt">Frakt & leverans ${icon("chevron", "ico--sm")}</a>
    </nav>`;

    U.$("#site-footer").innerHTML = `<div class="container footer__grid">
        <div class="footer__about">
          <span class="logo__word">sundla</span>
          <p>Kosttillskott med tydliga doser, %RI och jämförpris på varje produkt. Vi använder bara hälsopåståenden som är godkända av EU.</p>
          <div class="paylist" aria-label="Betalsätt">${SHOP.payments.map((p) => `<span>${esc(p.name)}</span>`).join("")}</div>
        </div>
        <div><h3>Sortiment</h3><ul>
          <li><a href="#/produkter">Alla produkter</a></li>
          ${S.categories.slice(0, 5).map((c) => `<li><a href="#/kategori/${c.id}">${esc(c.name)}</a></li>`).join("")}
          <li><a href="#/varumarken">Varumärken</a></li>
        </ul></div>
        <div><h3>Kundservice</h3><ul>
          <li><a href="#/info/kundservice">Vanliga frågor</a></li>
          <li><a href="#/info/frakt">Frakt & leverans</a></li>
          <li><a href="#/info/returer">Returer & reklamation</a></li>
          <li><a href="#/konto">Mina sidor</a></li>
          <li><a href="#/guide">Tillskottsguide</a></li>
        </ul></div>
        <div><h3>Om ${esc(SHOP.name)}</h3><ul>
          <li><a href="#/info/om-oss">Om oss</a></li>
          <li><a href="#/info/villkor">Köpvillkor</a></li>
          <li><a href="#/info/integritet">Integritet & cookies</a></li>
          <li><button type="button" class="link" style="background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:none" data-action="cookie-settings">Cookieinställningar</button></li>
        </ul></div>
        <div><h3>Kontakt</h3><ul>
          <li class="mono">${esc(SHOP.email)}</li>
          <li class="mono">${esc(SHOP.phone)}</li>
          <li class="muted">Vardagar 9–17</li>
          <li><a href="#/info/kundservice">Skicka meddelande</a></li>
        </ul></div>
      </div>
      <div class="container footer__legal">
        <p>Kosttillskott är inte ett substitut för en varierad och balanserad kost och en hälsosam livsstil. Den rekommenderade dagliga dosen bör inte överskridas. Förvaras oåtkomligt för små barn.</p>
        <p>© ${new Date().getFullYear()} ${esc(SHOP.company)} · Org.nr ${esc(SHOP.orgNr)} · ${esc(SHOP.address)} · Alla priser inkl. ${S.num(SHOP.vatRate * 100)} % moms.</p>
        ${SHOP.demo ? `<p><strong>Demobutik:</strong> inga beställningar skickas och inga betalningar dras. Produkter, varumärken och omdömen är exempel.</p>` : ""}
      </div>`;
  };

  /* ---------- Startsida ---------- */
  const best = () => S.products.filter((p) => p.stock > 0 && p.form !== "paket").sort((a, b) => b.sold - a.sold);

  V.home = function () {
    const b = best();
    const hero = [S.byId.get("p18"), S.byId.get("p22"), S.byId.get("p01")];
    const news = S.products.filter((p) => S.isNew(p)).sort((a, b) => b.added.localeCompare(a.added));
    const recent = S.state.recent.map((id) => S.byId.get(id)).filter(Boolean);
    const catTiles = S.categories.map((c) => {
      const rep = S.products.filter((p) => p.cat === c.id).sort((a, b) => b.sold - a.sold)[0];
      const n = S.products.filter((p) => p.cat === c.id).length;
      return `<a class="cat-tile" href="#/kategori/${c.id}" style="--c:${c.color}">
        <span class="cat-tile__art">${U.packshot(rep, 'aria-hidden="true"')}</span>
        <span><strong>${esc(c.name)}</strong><br><span>${U.plural(n, "produkt", "produkter")}</span></span>
      </a>`;
    }).join("");
    const d3 = S.byId.get("p01");

    return `
    <section class="hero container">
      <div class="hero__grid">
        <div>
          <p class="eyebrow">Hösten är här · 3 för 2 på vitaminer</p>
          <h1>Kosttillskott med <em>koll på innehållet</em></h1>
          <p class="hero__lead">${S.products.length} noga utvalda produkter med dos, %RI och pris per dagsdos i klartext. Beställ före kl. ${SHOP.cutoffHour} så skickas paketet samma dag.</p>
          <div class="hero__ctas">
            <a class="btn btn--primary btn--lg" href="#/produkter">Handla alla produkter</a>
            <a class="btn btn--ghost btn--lg" href="#/guide">Hitta rätt med guiden</a>
          </div>
          <div class="hero__facts">
            <div><strong>4,7/5</strong><span>snittbetyg</span></div>
            <div><strong>1–3 dagar</strong><span>leveranstid</span></div>
            <div><strong>${S.money(SHOP.freeShippingThreshold)}</strong><span>gräns för fri frakt</span></div>
          </div>
        </div>
        <div class="hero__art" aria-hidden="true">
          <div class="hero__shelf"></div>
          <div class="hero__products">${hero.map((p) => U.packshot(p)).join("")}</div>
          <div class="hero__label">
            <h4>D3-vitamin · per kapsel</h4>
            <table><tr><td>Vitamin D3</td><td>50 µg</td><td>1000 %*</td></tr><tr><td>Pris/dagsdos</td><td></td><td>${S.money2(S.unitPrices(d3, d3.variants[1]).perDose)}</td></tr></table>
          </div>
        </div>
      </div>
    </section>

    <section class="section container" aria-labelledby="cats-h">
      <div class="section__head"><div><h2 id="cats-h">Handla efter kategori</h2></div><a class="link" href="#/produkter">Visa alla produkter</a></div>
      <div class="cat-grid">${catTiles}</div>
    </section>

    <section class="container" aria-labelledby="goals-h">
      <div class="section__head"><div><h2 id="goals-h">Handla efter mål</h2><p>Välj det du vill stötta så visar vi produkterna med godkända påståenden för just det.</p></div></div>
      <div class="goal-row">${S.goals.map((g) => `<a class="goal-chip" href="#/mal/${g.id}" style="--c:${g.color}"><i></i>${esc(g.name)}</a>`).join("")}</div>
    </section>

    ${U.rail("rail-best", "Bästsäljare", b.slice(0, 10), "Det våra kunder köper mest just nu.", `<a class="link" href="#/produkter" style="align-self:center;margin-right:8px">Visa alla</a>`)}

    <section class="section container">
      <div class="promo">
        <div class="promo__main">
          <p class="eyebrow" style="color:inherit;opacity:.85">Kampanj på hela kategorin</p>
          <h2>3 för 2 på alla vitaminer</h2>
          <p style="max-width:40ch">Lägg tre vitaminer i varukorgen så får du den billigaste på köpet. Gäller även barnens D-droppar och multivitaminer.</p>
          <a class="btn" href="#/kategori/vitaminer">Handla vitaminer</a>
          <svg class="promo__art" viewBox="0 0 200 200" aria-hidden="true">${U.packshotInner(S.byId.get("p03"))}</svg>
        </div>
        <div class="promo__side">
          <p class="eyebrow" style="color:inherit;opacity:.8">Första beställningen</p>
          <h2 style="font-size:var(--step-3)">10 % på hela ordern</h2>
          <p>Använd koden i kassan. Gäller en gång per kund.</p>
          <span class="promo__code">VALKOMMEN10</span>
          <button class="btn" type="button" data-action="copy-code" data-code="VALKOMMEN10">Kopiera koden</button>
        </div>
      </div>
    </section>

    ${U.rail("rail-new", "Nyheter", news, "Nytt i sortimentet de senaste 60 dagarna.", `<a class="link" href="#/nyheter" style="align-self:center;margin-right:8px">Visa alla</a>`)}

    <section class="section container">
      <div class="ri-explainer">
        <div style="display:grid;gap:12px">
          <p class="eyebrow">Så läser du etiketten</p>
          <h2>Vad betyder 1000 % RI?</h2>
          <p>%RI anger hur stor del av referensintaget en dagsdos ger, alltså den mängd en genomsnittlig vuxen behöver per dag. 50 µg D-vitamin är tio gånger referensintaget på 5 µg, men ligger under det säkra övre intaget för vuxna på 100 µg per dag som EFSA har satt.</p>
          <p>Därför visar vi alltid mängd, %RI och pris per dagsdos. Då kan du jämföra produkter på riktigt, inte bara förpackningar.</p>
          <a class="link" href="#/info/kundservice">Fler frågor och svar</a>
        </div>
        ${U.nutritionTable(S.byId.get("p06"))}
      </div>
    </section>

    <section class="section container" aria-label="Därför handlar du hos oss">
      <div class="usps">
        <div class="usp">${icon("truck")}<strong>Fri frakt över ${S.money(SHOP.freeShippingThreshold)}</strong><span>Ombud eller paketskåp. Hemleverans från 69 kr.</span></div>
        <div class="usp">${icon("return")}<strong>30 dagars öppet köp</strong><span>Oöppnade produkter tar vi tillbaka utan frågor.</span></div>
        <div class="usp">${icon("repeat")}<strong>Prenumerera & spara 10 %</strong><span>Välj intervall, pausa eller avsluta när du vill.</span></div>
        <div class="usp">${icon("flask")}<strong>Bara godkända påståenden</strong><span>Vi skriver inte mer än vad EU har godkänt.</span></div>
      </div>
    </section>

    ${recent.length ? U.rail("rail-recent", "Senast visade", recent.slice(0, 10)) : ""}

    <section class="section container">
      <div class="newsletter">
        <div><h2>Få 10 % på första köpet</h2><p>Nyhetsbrev med kampanjer och tips om kosttillskott ungefär två gånger i månaden. Avsluta när du vill.</p></div>
        <form data-form="newsletter" novalidate>
          <label class="visually-hidden" for="nl-email">E-postadress</label>
          <input class="input" id="nl-email" type="email" autocomplete="email" placeholder="din@epost.se" required>
          <button class="btn" type="submit">Prenumerera</button>
        </form>
      </div>
    </section>`;
  };

  /* ---------- Produktlistor med filter ---------- */
  const L = { key: null, f: null, sort: "popular", shown: SHOP.pageSize, view: S.storage.get("view", "grid") };
  const emptyFilters = () => ({ cat: [], goal: [], brand: [], diet: [], form: [], price: null, stock: false, sale: false, rating: 0 });
  const perDoseMin = (p) => Math.min(...p.variants.map((v) => v.price / (v.servings || 1)));
  const SORTS = {
    relevance: ["Relevans", null],
    popular: ["Populärast", (a, b) => b.sold - a.sold],
    rating: ["Bäst betyg", (a, b) => b.rating - a.rating || b.reviews - a.reviews],
    "price-asc": ["Lägst pris", (a, b) => S.lowestPrice(a) - S.lowestPrice(b)],
    "price-desc": ["Högst pris", (a, b) => S.lowestPrice(b) - S.lowestPrice(a)],
    dose: ["Lägst pris per dagsdos", (a, b) => perDoseMin(a) - perDoseMin(b)],
    new: ["Nyast", (a, b) => b.added.localeCompare(a.added)],
    name: ["Namn A–Ö", (a, b) => a.name.localeCompare(b.name, "sv")]
  };

  V.listingContext = function (route) {
    const [type, id] = route.parts;
    if (type === "kategori") {
      const c = S.catById.get(id);
      if (!c) return null;
      const banner = c.id === "vitaminer" ? `${icon("tag")} <span><strong>3 för 2:</strong> Lägg tre vitaminer i varukorgen – den billigaste ingår.</span>`
        : ["protein", "traning"].includes(c.id) ? `${icon("tag")} <span>Använd koden <strong class="mono">TRANING15</strong> för 15 % på protein och träning.</span>` : "";
      return { key: "c:" + id, title: c.name, intro: c.desc, base: S.products.filter((p) => p.cat === id), hide: "cat", crumbs: [["Hem", "#/"], ["Produkter", "#/produkter"], [c.name]], banner };
    }
    if (type === "mal") {
      const g = S.goalById.get(id);
      if (!g) return null;
      return { key: "g:" + id, title: g.name, intro: `Produkter som innehåller näringsämnen med godkända påståenden för ${g.name.toLowerCase()}, eller som våra kunder ofta väljer för det målet.`, base: S.products.filter((p) => p.goals.includes(id)), hide: "goal", crumbs: [["Hem", "#/"], ["Mål"], [g.name]] };
    }
    if (type === "varumarke") {
      const b = S.brandById.get(id);
      if (!b) return null;
      return { key: "b:" + id, title: b.name, intro: b.desc, base: S.products.filter((p) => p.brand === id), hide: "brand", crumbs: [["Hem", "#/"], ["Varumärken", "#/varumarken"], [b.name]] };
    }
    if (type === "kampanjer") {
      return { key: "sale", title: "Kampanjer", intro: "Sänkta priser, paketpriser och 3 för 2 på vitaminer. Det överstrukna priset är det lägsta priset de senaste 30 dagarna före sänkningen.", base: S.products.filter((p) => S.onSale(p) || p.campaign), crumbs: [["Hem", "#/"], ["Kampanjer"]],
        banner: `${icon("tag")} <span>Fler koder: <strong class="mono">SUNDLA20</strong> ger 20 % över 800 kr och <strong class="mono">FRIFRAKT</strong> ger fri frakt.</span>` };
    }
    if (type === "nyheter") {
      return { key: "new", title: "Nyheter", intro: "Produkter som kommit in de senaste 60 dagarna.", base: S.products.filter((p) => S.isNew(p)), crumbs: [["Hem", "#/"], ["Nyheter"]], sort: "new" };
    }
    if (type === "sok") {
      const q = route.query.q || "";
      const res = S.search(q);
      return { key: "q:" + q, title: q ? `Sökresultat för ”${q}”` : "Sök", intro: q ? U.plural(res.length, "träff", "träffar") : "Skriv i sökfältet ovan.", base: res, crumbs: [["Hem", "#/"], ["Sök"]], sort: "relevance", query: q };
    }
    return { key: "all", title: "Alla produkter", intro: `Hela sortimentet – ${S.products.length} produkter från ${S.brands.length} varumärken.`, base: S.products, crumbs: [["Hem", "#/"], ["Alla produkter"]] };
  };

  function matches(p, f, except) {
    if (except !== "cat" && f.cat.length && !f.cat.includes(p.cat)) return false;
    if (except !== "goal" && f.goal.length && !f.goal.some((g) => p.goals.includes(g))) return false;
    if (except !== "brand" && f.brand.length && !f.brand.includes(p.brand)) return false;
    if (except !== "diet" && f.diet.length && !f.diet.every((d) => p.diets.includes(d))) return false;
    if (except !== "form" && f.form.length && !f.form.includes(p.form)) return false;
    if (except !== "price" && f.price != null && S.lowestPrice(p) > f.price) return false;
    if (except !== "stock" && f.stock && p.stock <= 0) return false;
    if (except !== "sale" && f.sale && !(S.onSale(p) || p.campaign)) return false;
    if (except !== "rating" && f.rating && p.rating < f.rating) return false;
    return true;
  }
  function results(ctx) {
    const list = ctx.base.filter((p) => matches(p, L.f));
    const fn = SORTS[L.sort] && SORTS[L.sort][1];
    return fn ? list.slice().sort(fn) : list;
  }

  function facet(name, key, options, ctx) {
    const pool = ctx.base.filter((p) => matches(p, L.f, key));
    const rows = options.map(([value, label]) => {
      const n = pool.filter((p) => (key === "goal" ? p.goals.includes(value) : key === "diet" ? p.diets.includes(value) : p[key === "cat" ? "cat" : key] === value)).length;
      const checked = L.f[key].includes(value);
      if (!n && !checked) return "";
      return `<label class="filters__opt"><input type="checkbox" id="f-${key}-${value}" data-filter="${key}" value="${value}" ${checked ? "checked" : ""}> ${esc(label)} <span class="n">${n}</span></label>`;
    }).join("");
    if (!rows) return "";
    return `<div class="filters__group" role="group" aria-labelledby="fg-${key}"><h3 id="fg-${key}">${name}</h3>${rows}</div>`;
  }

  function filtersBody(ctx) {
    const prices = ctx.base.map(S.lowestPrice);
    const lo = prices.length ? Math.floor(Math.min(...prices) / 10) * 10 : 0;
    const hi = prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 0;
    const cur = L.f.price == null ? hi : L.f.price;
    const formsUsed = Object.keys(S.forms).filter((k) => ctx.base.some((p) => p.form === k));
    return [
      ctx.hide !== "cat" ? facet("Kategori", "cat", S.categories.map((c) => [c.id, c.name]), ctx) : "",
      ctx.hide !== "goal" ? facet("Mål", "goal", S.goals.map((g) => [g.id, g.name]), ctx) : "",
      facet("Kost & märkning", "diet", S.diets.map((d) => [d.id, d.name]), ctx),
      facet("Form", "form", formsUsed.map((k) => [k, S.forms[k].name]), ctx),
      ctx.hide !== "brand" ? facet("Varumärke", "brand", S.brands.map((b) => [b.id, b.name]), ctx) : "",
      hi > lo ? `<div class="filters__group"><h3 id="fg-price">Pris</h3><div class="filters__range">
        <label for="f-price" class="num">Upp till <strong>${S.money(cur)}</strong></label>
        <input type="range" id="f-price" data-filter="price" min="${lo}" max="${hi}" step="10" value="${cur}" aria-describedby="fg-price">
        <div class="muted num" style="display:flex;justify-content:space-between;font-size:12px"><span>${S.money(lo)}</span><span>${S.money(hi)}</span></div>
      </div></div>` : "",
      `<div class="filters__group" role="radiogroup" aria-labelledby="fg-rating"><h3 id="fg-rating">Betyg</h3>
        ${[[0, "Alla betyg"], [4.5, "4,5 och uppåt"], [4, "4 och uppåt"]].map(([v, l]) => `<label class="filters__opt"><input type="radio" name="f-rating" id="f-rating-${v}" data-filter="rating" value="${v}" ${L.f.rating === v ? "checked" : ""}> ${v ? U.stars(v, false) : ""} ${l}</label>`).join("")}
      </div>`,
      `<div class="filters__group"><h3>Övrigt</h3>
        <label class="filters__opt"><input type="checkbox" id="f-stock" data-filter="stock" ${L.f.stock ? "checked" : ""}> Finns i lager</label>
        <label class="filters__opt"><input type="checkbox" id="f-sale" data-filter="sale" ${L.f.sale ? "checked" : ""}> Rea & kampanj</label>
      </div>`
    ].join("");
  }

  function chips() {
    const out = [];
    const names = { cat: (v) => S.catById.get(v).name, goal: (v) => S.goalById.get(v).name, brand: (v) => S.brandById.get(v).name, diet: (v) => S.dietById.get(v).name, form: (v) => S.forms[v].name };
    ["cat", "goal", "brand", "diet", "form"].forEach((k) => L.f[k].forEach((v) => out.push([k, v, names[k](v)])));
    if (L.f.price != null) out.push(["price", "", `Max ${S.money(L.f.price)}`]);
    if (L.f.rating) out.push(["rating", "", `Betyg ${S.num(L.f.rating)}+`]);
    if (L.f.stock) out.push(["stock", "", "I lager"]);
    if (L.f.sale) out.push(["sale", "", "Rea & kampanj"]);
    if (!out.length) return "";
    return out.map(([k, v, label]) => `<span class="chip">${esc(label)}<button type="button" data-action="unfilter" data-facet="${k}" data-value="${esc(v)}" aria-label="Ta bort filter ${esc(label)}">${icon("x")}</button></span>`).join("")
      + `<button type="button" class="chip chip--clear" data-action="clear-filters">Rensa alla</button>`;
  }

  function resultsHtml(ctx) {
    const list = results(ctx);
    const shown = list.slice(0, L.shown);
    if (!list.length) {
      const popular = ["D-vitamin", "Magnesium", "Kreatin", "Omega-3", "Protein", "Kollagen"];
      return ctx.query != null && !L.f.cat.length && !ctx.base.length
        ? U.empty("Inga träffar", `Vi hittade inget som matchar ”${esc(ctx.query)}”. Kontrollera stavningen eller prova något av det här:`,
          `<div class="goal-row" style="justify-content:center">${popular.map((q) => `<a class="goal-chip" href="#/sok?q=${encodeURIComponent(q)}">${q}</a>`).join("")}</div>`)
        : U.empty("Inga produkter matchar filtren", "Ta bort något filter för att se fler produkter.", `<button class="btn btn--primary" type="button" data-action="clear-filters">Rensa alla filter</button>`);
    }
    return `${U.grid(shown, L.view === "list" ? "product-grid--list" : "")}
      ${list.length > shown.length ? `<div class="load-more">
        <span class="muted num">Visar ${shown.length} av ${list.length}</span>
        <div class="load-more__bar" aria-hidden="true"><span style="width:${(shown.length / list.length) * 100}%"></span></div>
        <button class="btn btn--ghost" type="button" data-action="load-more">Visa fler produkter</button>
      </div>` : ""}`;
  }

  V.listing = function (route) {
    const ctx = V.listingContext(route);
    if (!ctx) return V.notFound();
    if (L.key !== ctx.key) {
      L.key = ctx.key;
      L.f = emptyFilters();
      L.sort = ctx.sort || "popular";
      L.shown = SHOP.pageSize;
    }
    L.ctx = ctx;
    const n = results(ctx).length;
    const sortOpts = Object.entries(SORTS).filter(([k]) => k !== "relevance" || ctx.query != null);
    return `${U.crumbs(ctx.crumbs)}
      <div class="container listing__head">
        <h1>${esc(ctx.title)}</h1>
        <p>${esc(ctx.intro)}</p>
        ${ctx.banner ? `<div class="demo-note" style="justify-self:start">${ctx.banner}</div>` : ""}
      </div>
      <div class="container listing">
        <aside class="filters" id="filters" aria-label="Filter">
          <div class="filters__mobile-head"><h2 style="font-size:var(--step-2)">Filter</h2><button class="icon-btn" type="button" data-action="filters-close" aria-label="Stäng filter">${icon("x")}</button></div>
          <div id="filters-body">${filtersBody(ctx)}</div>
          <button class="btn btn--primary btn--block only-mobile" type="button" data-action="filters-close" id="filters-done" style="margin-top:12px">Visa ${U.plural(n, "produkt", "produkter")}</button>
        </aside>
        <div style="min-width:0">
          <div class="toolbar">
            <span class="toolbar__count" id="result-count" aria-live="polite">${U.plural(n, "produkt", "produkter")}</span>
            <button class="btn btn--ghost btn--sm filters-open" type="button" data-action="filters-open" aria-controls="filters">${icon("filter", "ico--sm")} Filter</button>
            <label class="visually-hidden" for="sort">Sortera</label>
            <select class="select" id="sort" data-action="sort">${sortOpts.map(([k, [label]]) => `<option value="${k}" ${L.sort === k ? "selected" : ""}>${label}</option>`).join("")}</select>
            <div class="view-toggle hide-sm" role="group" aria-label="Visning">
              <button type="button" data-action="view-mode" data-mode="grid" aria-pressed="${L.view === "grid"}">Rutnät</button>
              <button type="button" data-action="view-mode" data-mode="list" aria-pressed="${L.view === "list"}">Lista</button>
            </div>
          </div>
          <div class="chips" id="chips">${chips()}</div>
          <div id="results">${resultsHtml(ctx)}</div>
        </div>
      </div>`;
  };

  V.updateListing = function ({ filters = true } = {}) {
    const ctx = L.ctx;
    if (!ctx || !U.$("#results")) return;
    const n = results(ctx).length;
    U.$("#results").innerHTML = resultsHtml(ctx);
    U.$("#chips").innerHTML = chips();
    U.$("#result-count").textContent = U.plural(n, "produkt", "produkter");
    U.$("#filters-done").textContent = `Visa ${U.plural(n, "produkt", "produkter")}`;
    if (filters) {
      const active = document.activeElement && document.activeElement.id;
      U.$("#filters-body").innerHTML = filtersBody(ctx);
      if (active && document.getElementById(active)) document.getElementById(active).focus();
    }
  };
  V.listingState = L;
  V.setFilter = function (key, value, on) {
    if (["cat", "goal", "brand", "diet", "form"].includes(key)) {
      const arr = L.f[key];
      const i = arr.indexOf(value);
      if (on && i < 0) arr.push(value);
      if (!on && i >= 0) arr.splice(i, 1);
    } else if (key === "price") L.f.price = value;
    else if (key === "rating") L.f.rating = value;
    else L.f[key] = on;
    L.shown = SHOP.pageSize;
  };
  V.clearFilters = () => { L.f = emptyFilters(); L.shown = SHOP.pageSize; };

  /* ---------- Varumärken ---------- */
  V.brands = () => `${U.crumbs([["Hem", "#/"], ["Varumärken"]])}
    <section class="section container"><h1>Varumärken</h1>
      <div class="cat-grid" style="margin-top:20px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">
        ${S.brands.map((b) => {
          const list = S.products.filter((p) => p.brand === b.id);
          const rep = list.sort((a, c) => c.sold - a.sold)[0];
          return `<a class="cat-tile" href="#/varumarke/${b.id}" style="--c:${U.catColor(rep)}">
            <span class="cat-tile__art">${U.packshot(rep, 'aria-hidden="true"')}</span>
            <span><strong>${esc(b.name)}</strong><br><span>${esc(b.desc)}</span><br><span class="mono">${U.plural(list.length, "produkt", "produkter")}</span></span></a>`;
        }).join("")}
      </div></section>`;

  /* ---------- Produktsida ---------- */
  const PD = { id: null, variantId: null, flavor: null, sub: 0, interval: 30, qty: 1, view: "pack", reviewSort: "relevant", reviewForm: false };
  V.pdpState = PD;

  function cutoffText() {
    const now = new Date();
    const wd = now.getDay();
    if (wd !== 0 && wd !== 6 && now.getHours() < SHOP.cutoffHour) {
      const left = new Date(now);
      left.setHours(SHOP.cutoffHour, 0, 0, 0);
      const mins = Math.max(1, Math.round((left - now) / 60000));
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `Beställ inom <strong>${h ? `${h} h ` : ""}${m} min</strong> så skickas paketet i dag.`;
    }
    return `Skickas <strong>${U.fmtDay(S.shipDate(now))}</strong>.`;
  }

  V.buyBox = function (p) {
    const v = S.getVariant(p, PD.variantId);
    const st = S.stockState(p);
    const unit = PD.sub ? S.round2(v.price * (1 - SHOP.subscriptionDiscount)) : v.price;
    const u = S.unitPrices(p, v);
    const [from, to] = S.deliveryWindow(SHOP.shipping[0]);
    const fav = S.state.favorites.includes(p.id);
    const isBundle = p.form === "paket";
    const sale = v.was && v.was > v.price;
    return `
      <div class="pdp__price">
        <span class="price__now ${sale || PD.sub ? "is-sale" : ""}">${S.money(unit * PD.qty)}</span>
        ${PD.sub ? `<span class="price__was">${S.money(v.price * PD.qty)}</span>` : sale ? `<span class="price__was">${S.money(v.was * PD.qty)}</span>` : ""}
        ${PD.qty > 1 ? `<span class="muted num">${PD.qty} × ${S.money(unit)}</span>` : ""}
      </div>
      <div class="pdp__unit num">
        ${u.compare ? `<span>Jfr-pris ${S.money2(u.compare.value)}/${u.compare.unit}</span>` : ""}
        ${u.perDose && !isBundle ? `<span>${S.money2(u.perDose)}/dagsdos</span>` : ""}
        ${v.servings && !isBundle ? `<span>Räcker ${v.servings} dagar</span>` : ""}
      </div>
      ${sale && !isBundle ? `<p class="pdp__omni">Överstruket pris är det lägsta priset de senaste 30 dagarna före prissänkningen.</p>` : ""}
      ${isBundle && v.was ? `<p class="pdp__omni">Köpt styckvis: ${S.money(v.was)}. Du sparar ${S.money(v.was - v.price)}.</p>` : ""}

      ${p.variants.length > 1 ? `<div class="opt-group"><span class="label" id="lbl-size">Storlek <span>– ${esc(v.label)}</span></span>
        <div class="opts" role="group" aria-labelledby="lbl-size">${p.variants.map((x) => `<button type="button" class="opt" id="opt-v-${x.id}" data-action="pdp-variant" data-variant="${x.id}" aria-pressed="${x.id === v.id}">
          <span>${esc(x.label)}</span><small>${S.money(x.price)}${x.servings && !isBundle ? ` · ${S.money2(x.price / x.servings)}/dos` : ""}</small></button>`).join("")}</div></div>` : ""}

      ${p.flavors && p.flavors.length ? `<div class="opt-group"><span class="label" id="lbl-flavor">Smak <span>– ${esc(PD.flavor)}</span></span>
        <div class="opts" role="group" aria-labelledby="lbl-flavor">${p.flavors.map((f, i) => `<button type="button" class="opt" id="opt-f-${i}" data-action="pdp-flavor" data-flavor="${esc(f)}" aria-pressed="${f === PD.flavor}">${esc(f)}</button>`).join("")}</div></div>` : ""}

      ${st !== "out" ? `<div class="buytype" role="radiogroup" aria-label="Köpsätt">
        <label><input type="radio" name="buytype" id="bt-once" value="0" data-action="pdp-buytype" ${!PD.sub ? "checked" : ""}><span><strong>Engångsköp</strong></span><span class="num">${S.money(v.price)}</span></label>
        <label><input type="radio" name="buytype" id="bt-sub" value="1" data-action="pdp-buytype" ${PD.sub ? "checked" : ""}><span><strong>Prenumerera</strong> och spara ${S.num(SHOP.subscriptionDiscount * 100)} %</span><span class="num">${S.money(S.round2(v.price * (1 - SHOP.subscriptionDiscount)))}</span>
          <span class="sub-extra">${icon("repeat", "ico--sm")} Leverans var
            <select class="select" id="bt-interval" data-action="pdp-interval" aria-label="Leveransintervall">${SHOP.subscriptionIntervals.map((d) => `<option value="${d}" ${PD.interval === d ? "selected" : ""}>${d}:e dag</option>`).join("")}</select>
            · pausa eller avsluta när du vill</span></label>
      </div>
      <div class="buyrow">
        <div class="qty" role="group" aria-label="Antal">
          <button type="button" data-action="pdp-qty" data-delta="-1" aria-label="Minska antal">${icon("minus", "ico--sm")}</button>
          <input id="pdp-qty" type="number" inputmode="numeric" min="1" max="${Math.min(20, p.stock)}" value="${PD.qty}" data-action="pdp-qty-input" aria-label="Antal">
          <button type="button" data-action="pdp-qty" data-delta="1" aria-label="Öka antal">${icon("plus", "ico--sm")}</button>
        </div>
        <button class="btn btn--primary btn--lg" type="button" id="pdp-add" data-action="pdp-add">${icon("cart")} Lägg i varukorgen</button>
        <button class="icon-btn fav-btn" type="button" data-action="fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? "Ta bort från favoriter" : "Spara som favorit"}">${icon(fav ? "heart-fill" : "heart")}</button>
      </div>
      <button class="btn btn--accent btn--block" type="button" data-action="pdp-buy-now">Köp nu – direkt till kassan</button>` : ""}

      <div class="stockline ${st === "low" ? "is-low" : st === "out" ? "is-out" : ""}"><span class="dot" aria-hidden="true"></span>
        ${st === "in" ? "I lager – skickas inom 24 h" : st === "low" ? `Få kvar – endast ${p.stock} st i lager` : "Tillfälligt slut"}</div>
      ${st !== "out" ? `<p class="cutoff">${icon("clock", "ico--sm")}<span>${cutoffText()} Leverans till ombud ${U.fmtDay(from)}–${U.fmtDay(to)}.</span></p>` : `
        <div class="watch"><strong>Bevaka produkten</strong><span class="muted" style="font-size:var(--step--1)">Vi skickar ett mejl när den finns i lager igen.</span>
          ${S.state.watch.some((w) => w.productId === p.id) ? `<span class="pill pill--ok">${icon("check", "ico--sm")} Du bevakar produkten</span>` : `
          <form data-form="watch" data-id="${p.id}" novalidate><label class="visually-hidden" for="watch-email">E-post</label>
            <input class="input" id="watch-email" type="email" autocomplete="email" placeholder="din@epost.se" value="${esc(S.state.profile.email || "")}" required>
            <button class="btn btn--primary" type="submit">Bevaka</button></form>`}
        </div>`}`;
  };

  function reviewsHtml(p) {
    const { list, dist, own } = U.reviewsFor(p);
    const total = p.reviews + own.length;
    const avg = own.length ? (p.rating * p.reviews + own.reduce((s, r) => s + r.rating, 0)) / total : p.rating;
    const sorted = list.slice();
    if (PD.reviewSort === "new") sorted.sort((a, b) => b.date.localeCompare(a.date));
    if (PD.reviewSort === "high") sorted.sort((a, b) => b.rating - a.rating);
    if (PD.reviewSort === "low") sorted.sort((a, b) => a.rating - b.rating);
    return `<div class="reviews">
      <div class="reviews__summary">
        <h2 id="reviews-h">Omdömen</h2>
        <div style="display:flex;gap:12px;align-items:center"><span class="reviews__avg num">${S.num(Math.round(avg * 10) / 10)}</span><div>${U.stars(avg)}<div class="muted" style="font-size:var(--step--1)">${U.plural(total, "omdöme", "omdömen")}</div></div></div>
        <div class="dist">${[5, 4, 3, 2, 1].map((k) => `<div><span>${k} ${icon("star", "ico--sm")}</span><span class="bar"><span style="width:${(dist[k] * 100).toFixed(1)}%"></span></span><span class="n">${Math.round(dist[k] * p.reviews)}</span></div>`).join("")}</div>
        <button class="btn btn--ghost" type="button" data-action="review-toggle" aria-expanded="${PD.reviewForm}" aria-controls="review-form">${icon("chat", "ico--sm")} Skriv ett omdöme</button>
      </div>
      <div style="min-width:0;display:grid;gap:8px;align-content:start">
        <form class="review-form" id="review-form" data-form="review" data-id="${p.id}" novalidate ${PD.reviewForm ? "" : "hidden"}>
          <h3>Ditt omdöme om ${esc(p.name)}</h3>
          <div class="field"><span class="label" id="rv-stars-l">Betyg</span>
            <div class="star-input" role="radiogroup" aria-labelledby="rv-stars-l">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rv-stars" id="rv-s${n}" value="${n}"><label for="rv-s${n}" title="${n} av 5">${icon("star")}<span class="visually-hidden">${n} av 5</span></label>`).join("")}</div>
            <span class="error" id="rv-stars-err" hidden>Välj ett betyg.</span></div>
          <div class="grid-2">
            <div class="field"><label for="rv-name">Namn</label><input class="input" id="rv-name" autocomplete="given-name" value="${esc(S.state.profile.first || "")}"><span class="error" id="rv-name-err" hidden>Skriv ditt namn.</span></div>
            <div class="field"><label for="rv-title">Rubrik</label><input class="input" id="rv-title" maxlength="60"><span class="error" id="rv-title-err" hidden>Skriv en rubrik.</span></div>
          </div>
          <div class="field"><label for="rv-text">Omdöme</label><textarea class="textarea" id="rv-text" maxlength="800"></textarea><span class="hint">Berätta om smak, hur lätt den är att ta och om du köper igen. Minst 20 tecken.</span><span class="error" id="rv-text-err" hidden>Skriv minst 20 tecken.</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--primary" type="submit">Publicera omdöme</button><button class="btn btn--ghost" type="button" data-action="review-toggle">Avbryt</button></div>
        </form>
        <div class="toolbar" style="margin:0"><span class="toolbar__count">Visar ${sorted.length} av ${U.plural(total, "omdöme", "omdömen")}</span>
          <label class="visually-hidden" for="review-sort">Sortera omdömen</label>
          <select class="select" id="review-sort" data-action="review-sort">${[["relevant", "Mest relevanta"], ["new", "Senaste"], ["high", "Högst betyg"], ["low", "Lägst betyg"]].map(([k, l]) => `<option value="${k}" ${PD.reviewSort === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        ${sorted.map((r) => `<article class="review">
          <div class="review__head">${U.stars(r.rating)}<strong>${esc(r.name)}</strong><span>${U.fmtDate(r.date)}</span>${r.verified ? `<span class="verified">${icon("check", "ico--sm")} Verifierat köp</span>` : ""}${r.own ? `<span class="pill">Ditt omdöme</span>` : ""}</div>
          <h4>${esc(r.title)}</h4><p>${esc(r.body)}</p>
          ${r.flavor ? `<span class="muted" style="font-size:12px">Smak: ${esc(r.flavor)}</span>` : ""}
        </article>`).join("")}
        <p class="muted" style="font-size:12px;padding-top:8px">Omdömena i demobutiken är exempeltext, utom de du själv skriver.</p>
      </div>
    </div>`;
  }
  V.reviewsHtml = reviewsHtml;

  function fbtHtml(p) {
    const items = [p, ...U.complements(p, 2)];
    if (items.length < 2 || p.stock <= 0) return "";
    const total = items.reduce((s, x) => s + x.variants[0].price, 0);
    return `<section class="section container" aria-labelledby="fbt-h"><div class="fbt">
      <h2 id="fbt-h" style="font-size:var(--step-2)">Köps ofta tillsammans</h2>
      <div class="fbt__items">${items.map((x, i) => `${i ? `<span class="fbt__plus" aria-hidden="true">${icon("plus")}</span>` : ""}
        <label class="fbt__item" style="--c:${U.catColor(x)}">
          <input type="checkbox" data-action="fbt-toggle" data-id="${x.id}" data-price="${x.variants[0].price}" checked aria-label="Ta med ${esc(x.name)}">
          <span class="fbt__thumb">${U.packshot(x, 'aria-hidden="true"')}</span>
          <span style="min-width:0"><strong style="display:block;line-height:1.25">${i === 0 ? "Den här: " : ""}${esc(x.name)}</strong><span class="muted" style="font-size:12px">${esc(x.variants[0].label)} · ${S.money(x.variants[0].price)}</span></span>
        </label>`).join("")}</div>
      <div class="fbt__foot"><span>Totalt: <strong class="num" id="fbt-total" style="font-size:var(--step-1)">${S.money(total)}</strong></span>
        <button class="btn btn--primary" type="button" data-action="fbt-add">${icon("cart")} Lägg valda i varukorgen</button></div>
    </div></section>`;
  }

  V.product = function (route) {
    const p = S.bySlug.get(route.parts[1]);
    if (!p) return V.notFound();
    if (PD.id !== p.id) Object.assign(PD, { id: p.id, variantId: p.variants[0].id, flavor: p.flavors ? p.flavors[0] : null, sub: 0, interval: 30, qty: 1, view: "pack", reviewSort: "relevant", reviewForm: false });
    const c = S.catById.get(p.cat);
    const recent = S.state.recent.filter((id) => id !== p.id).map((id) => S.byId.get(id)).filter(Boolean);
    const claims = p.claims.length
      ? `<ul class="claims">${p.claims.map((cl) => `<li>${icon("check")}<span>${esc(cl)}</span></li>`).join("")}</ul>`
      : `<p class="muted">Det finns inga EU-godkända hälsopåståenden för den här produkten, så vi beskriver bara vad den innehåller.</p>`;
    return `${U.crumbs([["Hem", "#/"], [c.name, `#/kategori/${c.id}`], [p.name]])}
      <div class="pdp container">
        <div class="gallery" style="--c:${c.color}">
          <div class="gallery__main" id="gallery-main">${PD.view === "dose" ? U.doseArt(p) : U.packshot(p)}</div>
          <div class="gallery__thumbs" role="group" aria-label="Bilder">
            <button type="button" data-action="pdp-view" data-view="pack" aria-pressed="${PD.view === "pack"}" aria-label="Visa förpackning">${U.packshot(p, 'aria-hidden="true"')}</button>
            ${p.form !== "paket" ? `<button type="button" data-action="pdp-view" data-view="dose" aria-pressed="${PD.view === "dose"}" aria-label="Visa dagsdos">${U.doseArt(p)}</button>` : ""}
          </div>
        </div>
        <div class="pdp__info">
          <a class="pdp__brand" href="#/varumarke/${p.brand}">${esc(S.brandById.get(p.brand).name)}</a>
          <h1 class="pdp__title">${esc(p.name)}</h1>
          <div class="pdp__meta">${U.rating(p)}<a href="#reviews" data-action="scroll-to" data-target="reviews">Läs omdömen</a>${U.badges(p)}</div>
          <p class="pdp__lead">${esc(p.short)}</p>
          <div class="tagrow">${U.dietTags(p, 7)}<span class="diet">${esc(S.forms[p.form].name)}</span><span class="diet">Dagsdos: ${esc(p.dose)}</span></div>
          <div id="pdp-buy" style="display:grid;gap:16px">${V.buyBox(p)}</div>
          <div class="usp-mini">
            <div>${icon("truck")} Fri frakt över ${S.money(SHOP.freeShippingThreshold)} – ombud eller paketskåp</div>
            <div>${icon("return")} 30 dagars öppet köp på oöppnade förpackningar</div>
            <div>${icon("lock")} Säker betalning med kort, Swish, faktura eller delbetalning</div>
          </div>
        </div>
      </div>

      ${fbtHtml(p)}

      <section class="container" aria-label="Produktinformation" style="max-width:var(--max)">
        <div class="acc">
          <details open><summary>Beskrivning ${icon("chevron")}</summary><div class="acc__body prose"><p>${esc(p.desc)}</p>${claims}</div></details>
          <details open><summary>Näringsinnehåll ${icon("chevron")}</summary><div class="acc__body" style="max-width:640px">${U.nutritionTable(p)}</div></details>
          <details><summary>Ingredienser & allergener ${icon("chevron")}</summary><div class="acc__body prose"><p>${bold(p.ingredients)}</p><p class="muted" style="font-size:var(--step--1)">Allergener markeras med fetstil.</p></div></details>
          <details><summary>Dosering & varningar ${icon("chevron")}</summary><div class="acc__body prose">
            <p><strong>Rekommenderad dos:</strong> ${esc(p.usage)}</p>
            ${p.warn ? `<div class="warnbox">${esc(p.warn)}</div>` : ""}
            <p class="muted">Den rekommenderade dagliga dosen bör inte överskridas. Kosttillskott är inte ett substitut för en varierad och balanserad kost och en hälsosam livsstil. Förvaras oåtkomligt för små barn, torrt och i rumstemperatur.</p>
          </div></details>
          <details><summary>Frakt & retur ${icon("chevron")}</summary><div class="acc__body prose">
            <ul>${SHOP.shipping.map((s) => `<li>${esc(s.name)} (${esc(s.carrier)}): ${S.money(s.price)}${s.freeOver ? `, fri frakt över ${S.money(s.freeOver)}` : ""}</li>`).join("")}</ul>
            <p>30 dagars öppet köp på oöppnade förpackningar. <a class="link" href="#/info/returer">Läs mer om returer</a>.</p>
          </div></details>
        </div>
      </section>

      <section class="section container" id="reviews" aria-labelledby="reviews-h" tabindex="-1"><div id="reviews-body">${reviewsHtml(p)}</div></section>

      ${U.rail("rail-related", `Mer inom ${c.name.toLowerCase()}`, U.related(p))}
      ${recent.length ? U.rail("rail-recent", "Senast visade", recent.slice(0, 10)) : ""}

      ${p.stock > 0 ? `<div class="sticky-buy" id="sticky-buy" aria-hidden="true">
        <span class="sticky-buy__name">${esc(p.name)}</span>
        <button class="btn btn--primary btn--sm" type="button" data-action="pdp-add" tabindex="-1">${icon("cart", "ico--sm")} Lägg i varukorgen</button>
      </div>` : ""}`;
  };

  /* ---------- Varukorg ---------- */
  function lineHtml(l, compact) {
    const free3 = l.p.campaign === "3for2" && !l.sub;
    return `<div class="line" style="--c:${U.catColor(l.p)}">
      <a class="line__thumb" href="#/produkt/${l.p.slug}" tabindex="-1" aria-hidden="true">${U.packshot(l.p, 'aria-hidden="true"')}</a>
      <div style="min-width:0">
        <a class="line__name" href="#/produkt/${l.p.slug}">${esc(l.p.name)}</a>
        <div class="line__meta">
          <span>${esc(l.v.label)}${l.flavor ? ` · ${esc(l.flavor)}` : ""}</span>
          ${l.sub ? `<span class="sub">${icon("repeat", "ico--sm")} Prenumeration var ${l.sub}:e dag (−${S.num(SHOP.subscriptionDiscount * 100)} %)</span>` : ""}
          ${free3 ? `<span style="color:var(--sale);font-weight:600">Ingår i 3 för 2</span>` : ""}
        </div>
        <div class="line__actions">
          <div class="qty ${compact ? "qty--sm" : ""}" role="group" aria-label="Antal ${esc(l.p.name)}">
            <button type="button" data-action="qty" data-key="${esc(l.key)}" data-delta="-1" aria-label="Minska antal" ${l.qty <= 1 ? "disabled" : ""}>${icon("minus", "ico--sm")}</button>
            <input type="number" inputmode="numeric" min="1" value="${l.qty}" data-action="qty-input" data-key="${esc(l.key)}" aria-label="Antal">
            <button type="button" data-action="qty" data-key="${esc(l.key)}" data-delta="1" aria-label="Öka antal">${icon("plus", "ico--sm")}</button>
          </div>
          <button class="line__remove" type="button" data-action="remove" data-key="${esc(l.key)}">Ta bort</button>
        </div>
      </div>
      <div class="line__price">${S.money(l.total)}${l.sub ? `<s>${S.money(l.list * l.qty)}</s>` : ""}</div>
    </div>`;
  }
  V.lineHtml = lineHtml;

  V.shipProgress = (t) => t.freeLeft > 0
    ? `<div class="ship-progress"><span>Handla för <strong class="num">${S.money(t.freeLeft)}</strong> till så får du fri frakt.</span><div class="ship-progress__bar"><span style="width:${t.freePct}%"></span></div></div>`
    : `<div class="ship-progress is-done"><span>${icon("check", "ico--sm")} Du har fri frakt till ombud och paketskåp!</span><div class="ship-progress__bar"><span style="width:100%"></span></div></div>`;

  V.codeBlock = function (t) {
    if (S.state.code) {
      const c = SHOP.discountCodes[S.state.code];
      return `<div class="code-applied"><span>${icon("tag", "ico--sm")} ${esc(S.state.code)} – ${esc(c ? c.label : "")}</span><button type="button" data-action="remove-code">Ta bort</button></div>
        ${t.codeError ? `<p class="code-msg is-error">${esc(t.codeError)}</p>` : ""}`;
    }
    return `<div class="field"><label for="code-input">Rabattkod</label>
      <div class="code-form"><input class="input" id="code-input" data-action="code-input" autocomplete="off" placeholder="T.ex. VALKOMMEN10" aria-describedby="code-msg">
      <button class="btn btn--ghost" type="button" data-action="apply-code">Använd</button></div>
      <p class="code-msg" id="code-msg" role="status"></p></div>`;
  };

  V.totalsHtml = function (t, withShipping) {
    return `<div class="totals">
      <div><span>Varor (${t.count} st)</span><span>${S.money(t.subtotal)}</span></div>
      ${t.subSavings > 0 ? `<div class="muted"><span>varav prenumerationsrabatt</span><span>−${S.money(t.subSavings)}</span></div>` : ""}
      ${t.campaign > 0 ? `<div class="discount"><span>3 för 2 på vitaminer</span><span>−${S.money(t.campaign)}</span></div>` : ""}
      ${t.codeDiscount > 0 ? `<div class="discount"><span>Rabattkod ${esc(S.state.code)}</span><span>−${S.money(t.codeDiscount)}</span></div>` : ""}
      ${withShipping
        ? `<div><span>Frakt (${esc(t.method.name.toLowerCase())})</span><span>${t.shipping ? S.money(t.shipping) : '<span style="color:var(--ok);font-weight:600">Fri frakt</span>'}</span></div>`
        : `<div><span>Frakt</span><span>${t.freeLeft <= 0 || t.freeShipByCode ? '<span style="color:var(--ok);font-weight:600">Fri frakt</span>' : `från ${S.money(Math.min(...SHOP.shipping.map((s) => s.price)))}`}</span></div>`}
      <div class="grand"><span>${withShipping ? "Att betala" : "Totalt"}</span><span>${S.money(withShipping ? t.total : t.merchandise)}</span></div>
      <div class="vat"><span>varav moms (${S.num(SHOP.vatRate * 100)} %)</span><span>${S.money2(withShipping ? t.vat : S.round2(t.merchandise - t.merchandise / (1 + SHOP.vatRate)))}</span></div>
    </div>`;
  };

  V.cartDrawer = function () {
    const t = S.totals();
    if (!t.lines.length) {
      return `<div class="drawer__section empty" style="padding-top:40px">${icon("cart", "ico--lg")}<h3>Varukorgen är tom</h3><p>Hitta något bland våra bästsäljare.</p>
        <a class="btn btn--primary" href="#/produkter" data-action="close-drawers">Fortsätt handla</a></div>
        <div class="drawer__section" style="display:grid;gap:4px">${best().slice(0, 4).map((p) => `<a class="suggest__item" href="#/produkt/${p.slug}" style="--c:${U.catColor(p)}"><span class="suggest__thumb" style="background:color-mix(in srgb,var(--c) 14%,var(--surface))">${U.packshot(p, 'aria-hidden="true"')}</span><span>${esc(p.name)}</span><span class="suggest__price">${S.money(S.lowestPrice(p))}</span></a>`).join("")}</div>`;
    }
    const cs = U.crossSell(2);
    return `<div class="drawer__section">${V.shipProgress(t)}</div>
      <div class="drawer__section" style="padding-top:0">${t.lines.map((l) => lineHtml(l, true)).join("")}</div>
      ${cs.length ? `<div class="drawer__section" style="background:var(--surface-2);display:grid;gap:8px"><strong style="font-size:var(--step--1)">Passar bra ihop med</strong>
        ${cs.map((p) => `<div class="suggest__item" style="--c:${U.catColor(p)};padding:4px 0"><span class="suggest__thumb" style="background:color-mix(in srgb,var(--c) 14%,var(--surface))">${U.packshot(p, 'aria-hidden="true"')}</span>
          <span style="min-width:0"><a href="#/produkt/${p.slug}" style="text-decoration:none;font-weight:600">${esc(p.name)}</a><br><span class="muted num" style="font-size:12px">${S.money(p.variants[0].price)}</span></span>
          <button class="btn btn--ghost btn--sm" style="margin-left:auto" type="button" data-action="add" data-id="${p.id}" aria-label="Lägg ${esc(p.name)} i varukorgen">${icon("plus", "ico--sm")}</button></div>`).join("")}</div>` : ""}
      <div class="drawer__foot">
        ${V.totalsHtml(t, false)}
        <a class="btn btn--primary btn--lg btn--block" href="#/kassa">${icon("lock", "ico--sm")} Till kassan</a>
        <a class="btn btn--ghost btn--block" href="#/varukorg">Visa varukorg & rabattkod</a>
      </div>`;
  };

  V.cart = function () {
    const t = S.totals();
    if (!t.lines.length) {
      return `${U.crumbs([["Hem", "#/"], ["Varukorg"]])}<section class="container">${U.empty("Varukorgen är tom", "Lägg till produkter så hamnar de här.", `<a class="btn btn--primary" href="#/produkter">Handla produkter</a>`)}</section>
        ${U.rail("rail-best", "Bästsäljare", best().slice(0, 10))}`;
    }
    return `${U.crumbs([["Hem", "#/"], ["Varukorg"]])}
      <div class="container" style="padding-top:14px"><h1 style="font-size:var(--step-3)">Varukorg <span class="muted num" style="font-weight:500">(${t.count})</span></h1></div>
      <div class="container cart-page">
        <div style="min-width:0;display:grid;gap:16px">
          <div class="panel">${V.shipProgress(t)}</div>
          <div class="panel" style="padding-block:4px">${t.lines.map((l) => lineHtml(l, false)).join("")}</div>
          <a class="link" href="#/produkter">← Fortsätt handla</a>
        </div>
        <aside class="panel panel--sticky" aria-label="Sammanfattning">
          <h2 style="font-size:var(--step-2)">Sammanfattning</h2>
          ${V.codeBlock(t)}
          ${V.totalsHtml(t, false)}
          <a class="btn btn--primary btn--lg btn--block" href="#/kassa">${icon("lock", "ico--sm")} Gå till kassan</a>
          <div class="paylist" style="justify-content:center">${SHOP.payments.map((p) => `<span>${esc(p.name)}</span>`).join("")}</div>
          <p class="muted" style="font-size:12px;text-align:center">30 dagars öppet köp · Säker betalning</p>
        </aside>
      </div>
      ${U.rail("rail-cross", "Passar bra ihop med", U.crossSell(8))}`;
  };

  /* ---------- Kassa ---------- */
  const CO = { ship: "ombud", pay: "kort", draft: null };
  V.checkoutState = CO;

  function field(id, label, opts = {}) {
    const d = CO.draft || {};
    const val = opts.value != null ? opts.value : d[id] || "";
    return `<div class="field ${opts.cls || ""}" ${opts.style ? `style="${opts.style}"` : ""}>
      <label for="${id}">${label}${opts.optional ? ' <span class="muted" style="font-weight:400">(valfritt)</span>' : ""}</label>
      <input class="input" id="${id}" name="${id}" type="${opts.type || "text"}" ${opts.autocomplete ? `autocomplete="${opts.autocomplete}"` : ""} ${opts.inputmode ? `inputmode="${opts.inputmode}"` : ""} ${opts.placeholder ? `placeholder="${opts.placeholder}"` : ""} ${opts.maxlength ? `maxlength="${opts.maxlength}"` : ""} value="${esc(val)}" aria-describedby="${id}-err${opts.hint ? ` ${id}-hint` : ""}">
      ${opts.hint ? `<span class="hint" id="${id}-hint">${opts.hint}</span>` : ""}
      <span class="error" id="${id}-err" hidden></span>
    </div>`;
  }
  V.field = field;

  V.shippingChoices = function () {
    return SHOP.shipping.map((m) => {
      const t = S.totals(m.id);
      const [from, to] = S.deliveryWindow(m);
      const when = from.toDateString() === to.toDateString() ? U.fmtDay(from) : `${U.fmtDay(from)}–${U.fmtDay(to)}`;
      return `<label class="choice"><input type="radio" name="ship" value="${m.id}" data-action="co-ship" ${CO.ship === m.id ? "checked" : ""}>
        <span class="choice__title">${esc(m.name)} <span class="muted" style="font-weight:400">· ${esc(m.carrier)}</span></span>
        <span class="choice__price ${t.shipping ? "" : "is-free"}">${t.shipping ? S.money(t.shipping) : "Gratis"}</span>
        <span class="choice__desc">${esc(m.desc)} Beräknad leverans: ${when}.</span></label>`;
    }).join("");
  };

  V.paymentChoices = function () {
    const t = S.totals(CO.ship);
    const d = CO.draft || {};
    const extra = {
      kort: `<div class="demo-note">${icon("shield")}<span><strong>Testläge.</strong> Kortuppgifter sparas eller skickas aldrig. Använd testkortet <span class="mono">4242 4242 4242 4242</span>, valfritt framtida datum och valfri CVC.</span></div>
        ${field("cc-number", "Kortnummer", { autocomplete: "off", inputmode: "numeric", placeholder: "1234 5678 9012 3456", maxlength: 23, value: "" })}
        <div class="grid-2">${field("cc-exp", "Giltigt till", { autocomplete: "off", inputmode: "numeric", placeholder: "MM/ÅÅ", maxlength: 5, value: "" })}${field("cc-cvc", "CVC", { autocomplete: "off", inputmode: "numeric", placeholder: "123", maxlength: 4, value: "" })}</div>
        ${field("cc-name", "Namn på kortet", { autocomplete: "off", value: d["cc-name"] || "" })}`,
      swish: `${field("sw-phone", "Mobilnummer för Swish", { type: "tel", autocomplete: "tel", inputmode: "tel", value: d["sw-phone"] || d["co-phone"] || "" })}
        <div class="demo-note">${icon("shield")}<span>Du godkänner betalningen i Swish-appen. I demobutiken simuleras godkännandet.</span></div>`,
      faktura: `<div class="demo-note">${icon("shield")}<span>Fakturan skickas till din e-post och ska betalas inom 30 dagar. Ingen avgift. En kreditupplysning kan göras.</span></div>`,
      delbetala: `<div class="demo-note">${icon("shield")}<span><strong class="num">3 × ${S.money(Math.ceil(t.total / 3))}</strong> per månad. 0 % ränta, ingen uppläggningsavgift. Totalt ${S.money(t.total)}.</span></div>`
    };
    return SHOP.payments.map((m) => `<label class="choice"><input type="radio" name="pay" value="${m.id}" data-action="co-pay" ${CO.pay === m.id ? "checked" : ""}>
      <span class="choice__title">${esc(m.name)}</span>
      ${m.id === "kort" ? `<span class="card-icons"><span>VISA</span><span>MC</span><span>AMEX</span></span>` : "<span></span>"}
      <span class="choice__desc">${esc(m.desc)}</span>
      <div class="choice__extra" data-pay-extra="${m.id}" ${CO.pay === m.id ? "" : "hidden"}>${extra[m.id]}</div></label>`).join("");
  };

  V.checkoutSummary = function () {
    const t = S.totals(CO.ship);
    return `<h2 style="font-size:var(--step-2)">Din order</h2>
      <div class="summary-lines">${t.lines.map((l) => `<div class="summary-line" style="--c:${U.catColor(l.p)}">
        <span class="summary-line__thumb">${U.packshot(l.p, 'aria-hidden="true"')}<b>${l.qty}</b></span>
        <span style="min-width:0"><strong style="display:block;line-height:1.25">${esc(l.p.name)}</strong><span class="muted" style="font-size:12px">${esc(l.v.label)}${l.flavor ? ` · ${esc(l.flavor)}` : ""}${l.sub ? ` · var ${l.sub}:e dag` : ""}</span></span>
        <span class="num" style="font-weight:600">${S.money(l.total)}</span></div>`).join("")}</div>
      <a class="link" href="#/varukorg" style="font-size:var(--step--1)">Ändra varukorg</a>
      ${V.codeBlock(t)}
      ${V.totalsHtml(t, true)}`;
  };

  V.checkout = function () {
    const t = S.totals(CO.ship);
    if (!t.lines.length) {
      return `${U.crumbs([["Hem", "#/"], ["Kassa"]])}<section class="container">${U.empty("Varukorgen är tom", "Lägg till produkter innan du går till kassan.", `<a class="btn btn--primary" href="#/produkter">Handla produkter</a>`)}</section>`;
    }
    if (!CO.draft) {
      const pr = S.state.profile;
      CO.draft = { "co-email": pr.email || "", "co-phone": pr.phone || "", "co-first": pr.first || "", "co-last": pr.last || "", "co-street": pr.street || "", "co-co": pr.co || "", "co-zip": pr.zip || "", "co-city": pr.city || "" };
    }
    return `<div class="container checkout__head"><h1 style="font-size:var(--step-3)">Kassa</h1><span class="secure">${icon("lock", "ico--sm")} Säker utcheckning</span></div>
      <form class="container checkout" id="checkout-form" data-form="checkout" novalidate>
        <div class="steps">
          <div class="form-errors" id="co-errors" role="alert" hidden></div>
          <section class="step" aria-labelledby="st1">
            <div class="step__head"><span class="step__num" aria-hidden="true">1</span><h2 id="st1" style="font-size:var(--step-2)">Kontaktuppgifter</h2></div>
            <div class="grid-2">
              ${field("co-email", "E-post", { type: "email", autocomplete: "email", inputmode: "email", hint: "Hit skickar vi orderbekräftelse och kvitto." })}
              ${field("co-phone", "Mobilnummer", { type: "tel", autocomplete: "tel", inputmode: "tel", placeholder: "070-123 45 67", hint: "För avisering via sms." })}
            </div>
            <label class="check"><input type="checkbox" id="co-news" ${CO.draft["co-news"] ? "checked" : ""}> <span>Ja tack, skicka nyhetsbrev med erbjudanden (cirka två per månad).</span></label>
          </section>
          <section class="step" aria-labelledby="st2">
            <div class="step__head"><span class="step__num" aria-hidden="true">2</span><h2 id="st2" style="font-size:var(--step-2)">Leveransadress</h2></div>
            <div class="grid-2">${field("co-first", "Förnamn", { autocomplete: "given-name" })}${field("co-last", "Efternamn", { autocomplete: "family-name" })}</div>
            ${field("co-street", "Gatuadress", { autocomplete: "address-line1" })}
            ${field("co-co", "C/o eller lägenhetsnummer", { autocomplete: "address-line2", optional: true })}
            <div class="grid-3">${field("co-zip", "Postnummer", { autocomplete: "postal-code", inputmode: "numeric", placeholder: "123 45", maxlength: 6 })}${field("co-city", "Ort", { autocomplete: "address-level2" })}</div>
            <p class="muted" style="font-size:12px">Vi levererar inom Sverige.</p>
          </section>
          <section class="step" aria-labelledby="st3">
            <div class="step__head"><span class="step__num" aria-hidden="true">3</span><h2 id="st3" style="font-size:var(--step-2)">Leveranssätt</h2></div>
            <div class="choice-list" id="co-shipping" role="radiogroup" aria-labelledby="st3">${V.shippingChoices()}</div>
          </section>
          <section class="step" aria-labelledby="st4">
            <div class="step__head"><span class="step__num" aria-hidden="true">4</span><h2 id="st4" style="font-size:var(--step-2)">Betalning</h2></div>
            <div class="choice-list" id="co-payment" role="radiogroup" aria-labelledby="st4">${V.paymentChoices()}</div>
          </section>
          <section class="step" aria-labelledby="st5">
            <div class="step__head"><span class="step__num" aria-hidden="true">5</span><h2 id="st5" style="font-size:var(--step-2)">Bekräfta</h2></div>
            <label class="check"><input type="checkbox" id="co-save" ${CO.draft["co-save"] === false ? "" : "checked"}> <span>Spara mina uppgifter på Mina sidor till nästa köp.</span></label>
            <div class="field" id="co-terms-field"><label class="check"><input type="checkbox" id="co-terms" aria-describedby="co-terms-err"> <span>Jag godkänner <a class="link" href="#/info/villkor" target="_blank">köpvillkoren</a> och har läst <a class="link" href="#/info/integritet" target="_blank">integritetspolicyn</a>.</span></label><span class="error" id="co-terms-err" hidden></span></div>
            <button class="btn btn--primary btn--lg btn--block" type="submit" id="co-submit">${icon("lock", "ico--sm")} <span id="co-submit-label">Slutför köp – ${S.money(t.total)}</span></button>
            ${SHOP.demo ? `<p class="muted" style="font-size:12px;text-align:center">Demobutik: ingen betalning dras och inget skickas.</p>` : ""}
          </section>
        </div>
        <aside class="panel panel--sticky" id="co-summary" aria-label="Ordersammanfattning">${V.checkoutSummary()}</aside>
      </form>`;
  };

  /* ---------- Orderbekräftelse ---------- */
  V.order = function (route) {
    const o = S.state.orders.find((x) => x.id === route.parts[1]);
    if (!o) return V.notFound("Ordern hittades inte", "Ordrar sparas bara i den webbläsare där köpet gjordes.");
    const c = o.customer;
    const items = o.items.map((it) => ({ ...it, p: S.byId.get(it.productId) })).filter((it) => it.p);
    const from = new Date(o.shipping.from), to = new Date(o.shipping.to);
    return `<section class="container confirm">
      <div class="confirm__hero">
        <span class="confirm__check">${icon("check")}</span>
        <h1 style="font-size:var(--step-4)">Tack för din beställning, ${esc(c.first)}!</h1>
        <p class="muted">Ordernummer <strong class="mono" style="color:var(--ink)">${esc(o.id)}</strong> · ${U.fmtDate(o.date)}</p>
        <p>En orderbekräftelse skickas till <strong>${esc(c.email)}</strong>.${SHOP.demo ? " I demobutiken skickas inga mejl och ingen betalning har dragits." : ""}</p>
      </div>
      <ol class="timeline" aria-label="Orderstatus">
        <li class="is-done"><i></i>Mottagen</li><li><i></i>Packas</li><li><i></i>Skickad</li><li><i></i>Levererad</li>
      </ol>
      <div class="info-grid">
        <div class="panel"><h3>Leverans</h3><p><strong>${esc(o.shipping.name)}</strong> · ${esc(o.shipping.carrier)}<br>Beräknas ${from.toDateString() === to.toDateString() ? U.fmtDay(from) : `${U.fmtDay(from)}–${U.fmtDay(to)}`}</p>
          <p class="muted">${esc(c.first)} ${esc(c.last)}<br>${esc(c.street)}${c.co ? `<br>${esc(c.co)}` : ""}<br>${esc(c.zip)} ${esc(c.city)}</p></div>
        <div class="panel"><h3>Betalning</h3><p><strong>${esc(o.payment)}</strong><br>${S.money(o.totals.total)} inkl. moms</p>${o.paymentRef ? `<p class="muted mono">Ref: ${esc(o.paymentRef)}</p>` : ""}</div>
        <div class="panel"><h3>Kontakt</h3><p>${esc(c.email)}<br>${esc(c.phone)}</p></div>
      </div>
      <div class="panel">
        <h2 style="font-size:var(--step-2)">Din order</h2>
        <div class="summary-lines" style="max-height:none">${items.map((it) => `<div class="summary-line" style="--c:${U.catColor(it.p)}">
          <span class="summary-line__thumb">${U.packshot(it.p, 'aria-hidden="true"')}<b>${it.qty}</b></span>
          <span style="min-width:0"><strong style="display:block">${esc(it.name)}</strong><span class="muted" style="font-size:12px">${esc(it.variant)}${it.flavor ? ` · ${esc(it.flavor)}` : ""}${it.sub ? ` · prenumeration var ${it.sub}:e dag` : ""}</span></span>
          <span class="num" style="font-weight:600">${S.money(it.total)}</span></div>`).join("")}</div>
        <div class="totals">
          <div><span>Varor</span><span>${S.money(o.totals.subtotal)}</span></div>
          ${o.totals.campaign ? `<div class="discount"><span>3 för 2</span><span>−${S.money(o.totals.campaign)}</span></div>` : ""}
          ${o.totals.codeDiscount ? `<div class="discount"><span>Rabattkod ${esc(o.totals.code)}</span><span>−${S.money(o.totals.codeDiscount)}</span></div>` : ""}
          <div><span>Frakt</span><span>${o.totals.shipping ? S.money(o.totals.shipping) : "Fri frakt"}</span></div>
          <div class="grand"><span>Totalt</span><span>${S.money(o.totals.total)}</span></div>
          <div class="vat"><span>varav moms</span><span>${S.money2(o.totals.vat)}</span></div>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn--primary" href="#/produkter">Fortsätt handla</a><a class="btn btn--ghost" href="#/konto">Mina sidor</a></div>
    </section>`;
  };

  /* ---------- Mina sidor ---------- */
  function subscriptions() {
    const map = new Map();
    S.state.orders.slice().reverse().forEach((o) => o.items.filter((i) => i.sub).forEach((i) => {
      const key = `${i.productId}|${i.variantId}|${i.flavor || ""}`;
      const next = new Date(o.date);
      next.setDate(next.getDate() + i.sub);
      map.set(key, { key, item: i, p: S.byId.get(i.productId), next, order: o.id });
    }));
    return Array.from(map.values()).filter((s) => s.p);
  }

  V.account = function (route) {
    const tab = route.parts[1] || "ordrar";
    const subs = subscriptions();
    const tabs = [["ordrar", "Ordrar", S.state.orders.length], ["prenumerationer", "Prenumerationer", subs.length], ["favoriter", "Favoriter", S.state.favorites.length], ["bevakningar", "Bevakningar", S.state.watch.length], ["uppgifter", "Mina uppgifter", null]];
    let body = "";
    if (tab === "ordrar") {
      body = S.state.orders.length ? S.state.orders.map((o) => `<div class="panel order-card">
        <div class="order-card__head"><div><strong class="mono">${esc(o.id)}</strong> <span class="muted">· ${U.fmtDate(o.date)}</span></div><span class="pill pill--ok">${esc(o.status)}</span></div>
        <div class="order-card__thumbs">${o.items.map((i) => S.byId.get(i.productId)).filter(Boolean).map((p) => `<span style="--c:${U.catColor(p)}">${U.packshot(p, 'aria-hidden="true"')}</span>`).join("")}</div>
        <div class="order-card__head"><span class="num">${U.plural(o.items.reduce((n, i) => n + i.qty, 0), "vara", "varor")} · <strong>${S.money(o.totals.total)}</strong> · ${esc(o.shipping.name)}</span>
          <div style="display:flex;gap:8px"><a class="btn btn--ghost btn--sm" href="#/order/${o.id}">Visa order</a><button class="btn btn--primary btn--sm" type="button" data-action="reorder" data-id="${o.id}">Köp igen</button></div></div>
      </div>`).join("") : U.empty("Inga ordrar än", "När du har handlat visas dina ordrar här.", `<a class="btn btn--primary" href="#/produkter">Börja handla</a>`);
    } else if (tab === "prenumerationer") {
      body = subs.length ? subs.map((s) => {
        const paused = !!S.state.subsPaused[s.key];
        return `<div class="panel" style="display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:14px;align-items:center;--c:${U.catColor(s.p)}">
          <span class="summary-line__thumb" style="width:64px;height:64px">${U.packshot(s.p, 'aria-hidden="true"')}</span>
          <span style="min-width:0"><strong>${esc(s.p.name)}</strong><br><span class="muted" style="font-size:var(--step--1)">${esc(s.item.variant)}${s.item.flavor ? ` · ${esc(s.item.flavor)}` : ""} · ${s.item.qty} st var ${s.item.sub}:e dag · ${S.money(s.item.unit)}/st</span><br>
            <span style="font-size:var(--step--1)">${paused ? '<span class="pill pill--warn">Pausad</span>' : `Nästa leverans: <strong>${U.fmtDay(s.next)}</strong>`}</span></span>
          <button class="btn btn--ghost btn--sm" type="button" data-action="sub-pause" data-key="${esc(s.key)}">${paused ? "Återuppta" : "Pausa"}</button></div>`;
      }).join("") : U.empty("Inga prenumerationer", `Välj ”Prenumerera” på en produktsida så sparar du ${S.num(SHOP.subscriptionDiscount * 100)} % på varje leverans.`, `<a class="btn btn--primary" href="#/produkter">Hitta produkter</a>`);
    } else if (tab === "favoriter") {
      const favs = S.state.favorites.map((id) => S.byId.get(id)).filter(Boolean);
      body = favs.length ? U.grid(favs) : U.empty("Inga favoriter", "Tryck på hjärtat på en produkt för att spara den här.", `<a class="btn btn--primary" href="#/produkter">Hitta produkter</a>`);
    } else if (tab === "bevakningar") {
      const w = S.state.watch.map((x) => ({ ...x, p: S.byId.get(x.productId) })).filter((x) => x.p);
      body = w.length ? w.map((x) => `<div class="panel" style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><span><a class="link" href="#/produkt/${x.p.slug}">${esc(x.p.name)}</a><br><span class="muted" style="font-size:var(--step--1)">Meddelande till ${esc(x.email)}</span></span><span class="pill ${x.p.stock > 0 ? "pill--ok" : "pill--out"}">${x.p.stock > 0 ? "I lager nu" : "Slut i lager"}</span></div>`).join("")
        : U.empty("Inga bevakningar", "Bevaka en produkt som är slut så meddelar vi dig när den är tillbaka.");
    } else {
      const pr = S.state.profile;
      const f = (id, label, key, o = {}) => `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" data-key="${key}" type="${o.type || "text"}" autocomplete="${o.ac || "on"}" value="${esc(pr[key] || "")}"></div>`;
      body = `<form class="panel" data-form="profile" novalidate style="max-width:640px">
        <h2 style="font-size:var(--step-2)">Mina uppgifter</h2>
        <p class="muted" style="font-size:var(--step--1)">Uppgifterna fylls i automatiskt i kassan. De sparas bara i den här webbläsaren.</p>
        <div class="grid-2">${f("pf-first", "Förnamn", "first", { ac: "given-name" })}${f("pf-last", "Efternamn", "last", { ac: "family-name" })}</div>
        <div class="grid-2">${f("pf-email", "E-post", "email", { type: "email", ac: "email" })}${f("pf-phone", "Mobilnummer", "phone", { type: "tel", ac: "tel" })}</div>
        ${f("pf-street", "Gatuadress", "street", { ac: "address-line1" })}
        ${f("pf-co", "C/o", "co", { ac: "address-line2" })}
        <div class="grid-3">${f("pf-zip", "Postnummer", "zip", { ac: "postal-code" })}${f("pf-city", "Ort", "city", { ac: "address-level2" })}</div>
        <label class="check"><input type="checkbox" id="pf-news" ${pr.news ? "checked" : ""}> <span>Nyhetsbrev med erbjudanden</span></label>
        <div><button class="btn btn--primary" type="submit">Spara uppgifter</button></div>
      </form>`;
    }
    return `${U.crumbs([["Hem", "#/"], ["Mina sidor"]])}
      <div class="container" style="padding-top:14px"><h1 style="font-size:var(--step-3)">Mina sidor</h1><p class="muted">Hej${S.state.profile.first ? ` ${esc(S.state.profile.first)}` : ""}! Här ser du ordrar, prenumerationer och sparade produkter.</p></div>
      <div class="container account">
        <nav class="tabs" role="tablist" aria-label="Mina sidor">${tabs.map(([id, label, n]) => `<button type="button" role="tab" aria-selected="${tab === id}" data-action="nav" data-href="#/konto/${id}">${label}${n != null ? ` <span class="num muted">${n}</span>` : ""}</button>`).join("")}</nav>
        <div role="tabpanel" style="display:grid;gap:12px;min-width:0">${body}</div>
      </div>`;
  };

  V.favorites = function () {
    const favs = S.state.favorites.map((id) => S.byId.get(id)).filter(Boolean);
    return `${U.crumbs([["Hem", "#/"], ["Favoriter"]])}
      <section class="section container" style="padding-top:14px"><div class="section__head"><div><h1 style="font-size:var(--step-3)">Favoriter</h1><p>${U.plural(favs.length, "sparad produkt", "sparade produkter")}</p></div>
      ${favs.length ? `<button class="btn btn--primary" type="button" data-action="add-all-favs">${icon("cart", "ico--sm")} Lägg alla i varukorgen</button>` : ""}</div>
      ${favs.length ? U.grid(favs) : U.empty("Inga favoriter än", "Tryck på hjärtat på en produkt för att spara den här.", `<a class="btn btn--primary" href="#/produkter">Hitta produkter</a>`)}</section>`;
  };

  /* ---------- Jämför ---------- */
  V.compare = function () {
    const list = S.state.compare.map((id) => S.byId.get(id)).filter(Boolean);
    if (!list.length) {
      return `${U.crumbs([["Hem", "#/"], ["Jämför"]])}<section class="container">${U.empty("Inget att jämföra", `Kryssa i ”Jämför” på upp till ${SHOP.maxCompare} produkter.`, `<a class="btn btn--primary" href="#/produkter">Välj produkter</a>`)}</section>`;
    }
    const pd = list.map((p) => S.unitPrices(p, p.variants[0]).perDose || Infinity);
    const bestDose = Math.min(...pd);
    const bestRating = Math.max(...list.map((p) => p.rating));
    const row = (label, fn) => `<tr><th scope="row">${label}</th>${list.map((p, i) => `<td>${fn(p, i)}</td>`).join("")}</tr>`;
    return `${U.crumbs([["Hem", "#/"], ["Jämför"]])}
      <section class="section container" style="padding-top:14px">
        <div class="section__head"><div><h1 style="font-size:var(--step-3)">Jämför produkter</h1><p>Pris per dagsdos räknas på minsta förpackningen.</p></div><button class="btn btn--ghost" type="button" data-action="compare-clear">Rensa jämförelsen</button></div>
        <div class="compare-wrap"><table class="compare-table">
          <thead><tr><td></td>${list.map((p) => `<td><div class="compare-head" style="--c:${U.catColor(p)}"><span class="thumb">${U.packshot(p, 'aria-hidden="true"')}</span><a class="link" href="#/produkt/${p.slug}">${esc(p.name)}</a><button class="line__remove" style="justify-self:start" type="button" data-action="compare" data-id="${p.id}">Ta bort</button></div></td>`).join("")}</tr></thead>
          <tbody>
            ${row("Pris", (p) => `<strong class="num">${S.money(p.variants[0].price)}</strong><br><span class="muted">${esc(p.variants[0].label)}</span>`)}
            ${row("Pris/dagsdos", (p, i) => `<span class="num ${pd[i] === bestDose ? "best" : ""}">${pd[i] === Infinity ? "–" : S.money2(pd[i])}</span>`)}
            ${row("Jfr-pris", (p) => { const u = S.unitPrices(p, p.variants[0]).compare; return u ? `<span class="num">${S.money2(u.value)}/${u.unit}</span>` : "–"; })}
            ${row("Dagsdos", (p) => esc(p.dose))}
            ${row("Räcker", (p) => `${p.variants[0].servings} dagar`)}
            ${row("Form", (p) => esc(S.forms[p.form].name))}
            ${row("Huvudinnehåll", (p) => { const r = S.nutritionRows(p).slice(0, 3); return r.length ? r.map((x) => `${esc(x.name)}: <span class="num">${esc(x.amount)}</span>${x.ri != null ? ` <span class="muted num">(${S.num(x.ri)} %)</span>` : ""}`).join("<br>") : "Se produktsidan"; })}
            ${row("Betyg", (p) => `<span class="${p.rating === bestRating ? "best" : ""}">${S.num(p.rating)}</span> <span class="muted">(${S.num(p.reviews)})</span>`)}
            ${row("Kost", (p) => p.diets.map((d) => esc(S.dietById.get(d).name)).join(", ") || "–")}
            ${row("Märke", (p) => esc(S.brandById.get(p.brand).name))}
            ${row("Lager", (p) => ({ in: '<span class="pill pill--ok">I lager</span>', low: '<span class="pill pill--warn">Få kvar</span>', out: '<span class="pill pill--out">Slut</span>' })[S.stockState(p)])}
            ${row("", (p) => p.stock > 0 ? `<button class="btn btn--primary btn--sm" type="button" data-action="add" data-id="${p.id}">${icon("plus", "ico--sm")} Köp</button>` : "")}
          </tbody></table></div>
      </section>`;
  };

  /* ---------- Tillskottsguide (quiz) ---------- */
  const Q = { step: 0, goals: [], diet: "", form: "", budget: "" };
  V.quizState = Q;
  const QUESTIONS = [
    { key: "goals", title: "Vad vill du främst stötta?", help: "Välj upp till tre.", multi: 3, opts: S.goals.map((g) => [g.id, g.name, g.color]) },
    { key: "diet", title: "Hur äter du?", help: "Så att vi bara föreslår produkter som passar din kost.", opts: [["all", "Allätare"], ["vegetarian", "Vegetarian"], ["vegan", "Vegan"]] },
    { key: "form", title: "Vilken form föredrar du?", help: "", opts: [["caps", "Kapslar & tabletter"], ["drink", "Pulver & dryck"], ["any", "Spelar ingen roll"]] },
    { key: "budget", title: "Vad får det kosta per månad?", help: "Vi räknar på pris per dagsdos × 30.", opts: [["200", "Under 200 kr"], ["500", "200–500 kr"], ["any", "Över 500 kr"]] }
  ];

  function recommend() {
    const caps = ["kapslar", "tabletter", "sugtabletter", "tuggtabletter", "gummies"];
    const animal = /gelatin|fisk|krill|kollagen|ullfett/i;
    const ok = (p) => {
      if (p.stock <= 0 || p.form === "paket" || p.cat === "barn") return false;
      if (Q.diet === "vegan" && !p.diets.includes("vegan")) return false;
      if (Q.diet === "vegetarian" && animal.test(p.ingredients)) return false;
      if (Q.form === "caps" && !caps.includes(p.form)) return false;
      if (Q.form === "drink" && caps.includes(p.form)) return false;
      return true;
    };
    const monthly = (p) => S.unitPrices(p, p.variants[0]).perDose * 30;
    const picks = [];
    Q.goals.forEach((g) => {
      const cand = S.products.filter((p) => ok(p) && p.goals.includes(g) && !picks.some((x) => x.p.id === p.id)).sort((a, b) => (b.rating * 1000 + b.sold / 10) - (a.rating * 1000 + a.sold / 10));
      if (cand[0]) picks.push({ p: cand[0], why: `För ${S.goalById.get(g).name.toLowerCase()}`, claim: cand[0].claims[0] || cand[0].short });
    });
    const m = new Date().getMonth();
    if ((m >= 9 || m <= 2) && !picks.some((x) => x.p.cat === "vitaminer" && /D3/.test(x.p.name))) {
      const d = [S.byId.get("p01"), S.byId.get("p02"), S.byId.get("p10")].find((p) => ok(p));
      if (d) picks.push({ p: d, why: "Bas under det mörka halvåret", claim: "Livsmedelsverket påminner om att många i Sverige får för lite D-vitamin under vintern." });
    }
    const cap = Q.budget === "200" ? 200 : Q.budget === "500" ? 500 : Infinity;
    while (picks.length > 1 && picks.reduce((s, x) => s + monthly(x.p), 0) > cap) picks.pop();
    return picks.map((x) => ({ ...x, monthly: monthly(x.p) }));
  }
  V.recommend = recommend;

  V.quiz = function () {
    const total = QUESTIONS.length;
    if (Q.step >= total) {
      const recs = recommend();
      const sum = recs.reduce((s, r) => s + r.monthly, 0);
      return `${U.crumbs([["Hem", "#/"], ["Tillskottsguide"]])}
        <section class="container quiz">
          <div class="quiz__progress" aria-hidden="true"><span style="width:100%"></span></div>
          <p class="eyebrow">Ditt förslag</p>
          <h1 style="font-size:var(--step-3)">${recs.length ? `Vi föreslår ${U.plural(recs.length, "produkt", "produkter")}` : "Vi hittade inget som passar alla val"}</h1>
          ${recs.length ? `<p class="muted">Cirka <strong class="num" style="color:var(--ink)">${S.money(Math.round(sum))}</strong> per månad. Förslaget bygger på dina svar och är ingen medicinsk rådgivning.</p>` : `<p class="muted">Prova att ändra form eller budget.</p>`}
          <div style="display:grid;gap:10px">${recs.map((r) => `<div class="reco" style="--c:${U.catColor(r.p)}">
            <span class="reco__thumb">${U.packshot(r.p, 'aria-hidden="true"')}</span>
            <div style="min-width:0;display:grid;gap:2px"><span class="eyebrow">${esc(r.why)}</span><a class="link" style="text-decoration:none;font-size:var(--step-1)" href="#/produkt/${r.p.slug}">${esc(r.p.name)}</a><span class="reco__why">${esc(r.claim)}</span><span class="num muted" style="font-size:12px">${S.money(r.p.variants[0].price)} · ca ${S.money(Math.round(r.monthly))}/mån</span></div>
            <button class="btn btn--ghost btn--sm" type="button" data-action="add" data-id="${r.p.id}">${icon("plus", "ico--sm")} Köp</button>
          </div>`).join("")}</div>
          <div class="quiz__nav">
            <button class="btn btn--ghost" type="button" data-action="quiz-restart">Börja om</button>
            ${recs.length ? `<button class="btn btn--primary" type="button" data-action="quiz-add-all">${icon("cart", "ico--sm")} Lägg alla i varukorgen</button>` : ""}
          </div>
        </section>`;
    }
    const q = QUESTIONS[Q.step];
    const val = Q[q.key];
    const canNext = q.multi ? val.length > 0 : !!val;
    return `${U.crumbs([["Hem", "#/"], ["Tillskottsguide"]])}
      <section class="container quiz">
        <div class="quiz__progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${Q.step}" aria-label="Steg ${Q.step + 1} av ${total}"><span style="width:${(Q.step / total) * 100}%"></span></div>
        <p class="eyebrow">Fråga ${Q.step + 1} av ${total}</p>
        <h1 style="font-size:var(--step-3)">${q.title}</h1>
        ${q.help ? `<p class="muted">${q.help}</p>` : ""}
        <div class="quiz__opts" role="group" aria-label="${esc(q.title)}">${q.opts.map(([id, label, color]) => {
          const on = q.multi ? val.includes(id) : val === id;
          return `<button type="button" class="quiz__opt" id="quiz-${id}" data-action="quiz-pick" data-value="${id}" aria-pressed="${on}" ${color ? `style="--c:${color}"` : ""}><i></i>${esc(label)}</button>`;
        }).join("")}</div>
        <div class="quiz__nav">
          <button class="btn btn--ghost" type="button" data-action="quiz-back" ${Q.step === 0 ? "disabled" : ""}>Tillbaka</button>
          <button class="btn btn--primary" type="button" data-action="quiz-next" ${canNext ? "" : "disabled"}>${Q.step === total - 1 ? "Visa förslag" : "Nästa"}</button>
        </div>
      </section>`;
  };
  V.quizQuestions = QUESTIONS;

  /* ---------- Infosidor ---------- */
  const INFO = {
    "om-oss": ["Om oss", () => `<p>${esc(SHOP.name)} startade med en enkel idé: det ska gå att jämföra kosttillskott på innehåll, inte på förpackningar och löften. Därför visar vi mängd, %RI, jämförpris och pris per dagsdos för varje produkt.</p>
      <h2>Så väljer vi produkter</h2><ul><li>Doser som är dokumenterade och ligger under de säkra övre nivåer som EFSA har satt.</li><li>Råvaruformer som tas upp väl, till exempel magnesiumbisglycinat och metylkobalamin.</li><li>Bara hälsopåståenden som är godkända enligt EU-förordning 1924/2006.</li><li>Sporttillskott som är dopingtestade batch för batch.</li></ul>
      <h2>Lager och leverans</h2><p>Vi packar och skickar från vårt lager i Mellansverige. Beställer du före kl. ${SHOP.cutoffHour} en vardag skickas paketet samma dag.</p>`],
    kundservice: ["Kundservice & vanliga frågor", () => `<p>Hittar du inte svaret här? Skriv till oss på <span class="mono">${esc(SHOP.email)}</span> eller ring <span class="mono">${esc(SHOP.phone)}</span> vardagar 9–17. Vi svarar inom en arbetsdag.</p>
      <div class="faq">${[
        ["Hur snabbt levererar ni?", `Beställningar som läggs före kl. ${SHOP.cutoffHour} på vardagar skickas samma dag. Leveranstiden är normalt 1–3 vardagar till ombud och paketskåp, och nästa vardag med express.`],
        ["Vad kostar frakten?", `Från ${S.money(Math.min(...SHOP.shipping.map((s) => s.price)))}. Fri frakt till ombud och paketskåp när du handlar för minst ${S.money(SHOP.freeShippingThreshold)}.`],
        ["Vad betyder %RI?", "RI står för referensintag, den mängd av ett näringsämne som en genomsnittlig vuxen behöver per dag. 100 % RI betyder att dagsdosen ger hela referensintaget. Ett högre värde är inte farligt i sig, men den rekommenderade dosen ska inte överskridas."],
        ["Kan jag ta flera tillskott samtidigt?", "Ofta går det bra, men kontrollera att du inte får dubbla doser av samma ämne, till exempel D-vitamin i både multivitamin och D3-kapslar. Rådgör med läkare eller apotek om du tar läkemedel."],
        ["Jag är gravid eller ammar – vad gäller?", "Livsmedelsverket rekommenderar folsyra före och under tidig graviditet och D-vitamin till vissa grupper. Rådgör med din barnmorska innan du börjar med andra tillskott."],
        ["Hur fungerar prenumeration?", `Du sparar ${S.num(SHOP.subscriptionDiscount * 100)} % på varje leverans och väljer själv intervall (var ${SHOP.subscriptionIntervals.join(", ")}:e dag). Du kan pausa eller avsluta under Mina sidor när du vill, utan bindningstid.`],
        ["Är era sporttillskott dopingtestade?", "Ja, alla produkter märkta Dopingtestad testas batch för batch mot listan över förbjudna substanser innan de släpps till försäljning."],
        ["Hur returnerar jag en vara?", "Du har 30 dagars öppet köp på oöppnade förpackningar. Läs mer under Returer & reklamation."],
        ["Vilka betalsätt finns?", SHOP.payments.map((p) => `${p.name} (${p.desc.toLowerCase()})`).join(", ") + "."]
      ].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
      <h2>Kontakta oss</h2>
      <form class="panel" data-form="contact" novalidate style="max-width:640px">
        <div class="grid-2">${field("ct-name", "Namn", { autocomplete: "name", value: "" })}${field("ct-email", "E-post", { type: "email", autocomplete: "email", value: S.state.profile.email || "" })}</div>
        <div class="field"><label for="ct-topic">Ämne</label><select class="select" id="ct-topic"><option>Fråga om produkt</option><option>Min order</option><option>Retur eller reklamation</option><option>Prenumeration</option><option>Annat</option></select></div>
        ${field("ct-order", "Ordernummer", { optional: true, placeholder: "SU-1234567", value: "" })}
        <div class="field"><label for="ct-msg">Meddelande</label><textarea class="textarea" id="ct-msg" aria-describedby="ct-msg-err"></textarea><span class="error" id="ct-msg-err" hidden></span></div>
        <div><button class="btn btn--primary" type="submit">Skicka meddelande</button></div>
      </form>`],
    frakt: ["Frakt & leverans", () => `<p>Vi levererar till hela Sverige. Beställ före kl. ${SHOP.cutoffHour} på vardagar så skickas paketet samma dag.</p>
      <div style="overflow-x:auto"><table class="ship-table"><thead><tr><th>Leveranssätt</th><th>Leveranstid</th><th>Pris</th><th>Fri frakt</th></tr></thead><tbody>
      ${SHOP.shipping.map((s) => `<tr><td><strong>${esc(s.name)}</strong><br><span class="muted">${esc(s.carrier)}</span></td><td>${s.days[0] === s.days[1] ? `${s.days[0]} vardag` : `${s.days[0]}–${s.days[1]} vardagar`}</td><td class="num">${S.money(s.price)}</td><td class="num">${s.freeOver ? `över ${S.money(s.freeOver)}` : "–"}</td></tr>`).join("")}
      </tbody></table></div>
      <p>Du får ett sms eller mejl med spårningslänk när paketet har skickats. Outlösta paket debiteras med 149 kr för att täcka frakt och hantering.</p>`],
    returer: ["Returer & reklamation", () => `<h2>30 dagars öppet köp</h2><p>Oöppnade produkter med obruten försegling kan returneras inom 30 dagar från att du tog emot paketet. Av hygien- och säkerhetsskäl kan vi inte ta tillbaka öppnade livsmedel, utom vid reklamation.</p>
      <h2>Ångerrätt</h2><p>Enligt lagen om distansavtal har du 14 dagars ångerrätt. Ångerrätten gäller inte förseglade livsmedel där förseglingen har brutits.</p>
      <h2>Så returnerar du</h2><ul><li>Kontakta kundservice och uppge ordernumret.</li><li>Vi skickar en returetikett till din e-post. Returfrakten kostar 49 kr och dras från återbetalningen.</li><li>Pengarna betalas tillbaka till samma betalsätt inom 14 dagar efter att vi har tagit emot returen.</li></ul>
      <h2>Reklamation</h2><p>Är en vara skadad eller felaktig står vi för returfrakten. Skicka gärna en bild till kundservice så löser vi det snabbt, oftast med en ny vara direkt.</p>`],
    villkor: ["Köpvillkor", () => `<p>Villkoren gäller köp i ${esc(SHOP.name)}s webbutik. Säljare är ${esc(SHOP.company)}, org.nr ${esc(SHOP.orgNr)}, ${esc(SHOP.address)}.</p>
      <h2>Priser</h2><p>Alla priser anges i svenska kronor inklusive moms. Kosttillskott är livsmedel och beskattas med den reducerade livsmedelsmomsen, för närvarande ${S.num(SHOP.vatRate * 100)} %.</p>
      <h2>Avtal och betalning</h2><p>Avtalet blir bindande när du har fått en orderbekräftelse. Du betalar med kort, Swish, faktura eller delbetalning. Faktura och delbetalning förutsätter godkänd kreditprövning.</p>
      <h2>Leverans</h2><p>Leveranstider framgår i kassan. Om en vara är försenad meddelar vi dig, och du har rätt att häva köpet om förseningen är väsentlig.</p>
      <h2>Prenumeration</h2><p>Prenumerationer löper tills vidare utan bindningstid och kan pausas eller avslutas när som helst före nästa leverans.</p>
      <h2>Ångerrätt och reklamation</h2><p>Se <a class="link" href="#/info/returer">Returer & reklamation</a>. Reklamation enligt konsumentköplagen kan göras inom tre år.</p>
      <h2>Tvister</h2><p>Vid tvist följer vi Allmänna reklamationsnämndens rekommendationer. Du kan också använda EU-kommissionens plattform för tvistlösning online.</p>`],
    integritet: ["Integritetspolicy & cookies", () => `<p>Vi behandlar personuppgifter enligt dataskyddsförordningen (GDPR). Personuppgiftsansvarig är ${esc(SHOP.company)}.</p>
      <h2>Vilka uppgifter vi behandlar</h2><ul><li>Namn, adress, e-post och telefonnummer för att leverera din order.</li><li>Orderhistorik för kundservice, reklamationer och bokföring (sparas i 7 år enligt bokföringslagen).</li><li>E-postadress för nyhetsbrev om du har samtyckt. Du kan avregistrera dig när som helst.</li></ul>
      <h2>Dina rättigheter</h2><p>Du har rätt att begära utdrag, rättelse, radering och begränsning av dina uppgifter, samt att invända mot behandling. Kontakta oss på <span class="mono">${esc(SHOP.email)}</span>. Du kan också lämna klagomål till Integritetsskyddsmyndigheten (IMY).</p>
      <h2>Cookies</h2><p>Nödvändiga cookies och lokal lagring används för varukorg, inloggning och dina val. Statistik- och marknadsföringscookies används bara om du har godkänt dem.</p>
      <p><button class="btn btn--ghost" type="button" data-action="cookie-settings">Ändra cookieinställningar</button></p>
      ${SHOP.demo ? `<div class="demo-note">${icon("shield")}<span>I demobutiken sparas allt bara lokalt i din webbläsare. Inget skickas till någon server.</span></div>` : ""}`]
  };

  V.info = function (route) {
    const id = route.parts[1] || "kundservice";
    const page = INFO[id];
    if (!page) return V.notFound();
    const titles = { "om-oss": "Om oss", kundservice: "Kundservice", frakt: "Frakt & leverans", returer: "Returer", villkor: "Köpvillkor", integritet: "Integritet & cookies" };
    return `${U.crumbs([["Hem", "#/"], [page[0]]])}
      <div class="container info">
        <nav aria-label="Information"><ul>${Object.keys(INFO).map((k) => `<li><a href="#/info/${k}" ${k === id ? 'aria-current="page"' : ""}>${titles[k]}</a></li>`).join("")}</ul></nav>
        <article class="prose"><h1 style="font-size:var(--step-3)">${page[0]}</h1>${page[1]()}</article>
      </div>`;
  };
  V.infoTitle = (id) => (INFO[id] ? INFO[id][0] : "Information");

  V.notFound = (title = "Sidan finns inte", text = "Länken kan vara felaktig eller så har sidan flyttats.") => `<section class="container notfound">
    <p class="eyebrow">404</p><h1 style="font-size:var(--step-3)">${esc(title)}</h1><p class="muted">${esc(text)}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><a class="btn btn--primary" href="#/">Till startsidan</a><a class="btn btn--ghost" href="#/produkter">Alla produkter</a></div></section>`;

  window.Views = V;
})();
