/* Gemensamma UI-byggstenar: hjälpfunktioner, produktbilder (SVG), kort, toasts och lådor. */
(function () {
  const S = window.Store;
  const { SHOP } = S;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const icon = (id, cls = "") => `<svg class="ico ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const plural = (n, one, many) => `${S.num(n)} ${n === 1 ? one : many}`;
  const dateFmt = new Intl.DateTimeFormat("sv-SE", { weekday: "short", day: "numeric", month: "short" });
  const dateLong = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long", year: "numeric" });
  const fmtDay = (d) => dateFmt.format(new Date(d)).replace(".", "");
  const fmtDate = (d) => dateLong.format(new Date(d));
  const catColor = (p) => S.catById.get(p.cat).color;

  /* ---------- Färghjälp för förpackningar ---------- */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const t = amt < 0 ? 0 : 255;
    const k = Math.abs(amt);
    const ch = (c) => Math.round((t - c) * k + c);
    const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  }
  const inkOn = (hex) => (luminance(hex) > 0.36 ? "#1d1d1b" : "#ffffff");
  const fit = (text, width, max, k = 0.74) => Math.min(max, Math.floor((width / (Math.max(text.length, 1) * k)) * 10) / 10);

  /* ---------- Produktbilder ---------- */
  const WHITE = "#fbfbf7";
  function packshotInner(p) {
    const col = catColor(p);
    const brand = esc(S.brandById.get(p.brand).name.toUpperCase());
    const label = esc(p.label);
    const sub = esc(p.sub);
    const cap = shade(col, -0.32);
    const ink = inkOn(col);
    let shape = S.forms[p.form].shape;
    if (shape === "tub" && p.variants[0].g >= 750) shape = "pouch";
    const shadow = `<ellipse cx="100" cy="186" rx="54" ry="7" fill="#000" opacity=".13"/>`;
    const gloss = (x, y, h) => `<rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="#fff" opacity=".5"/>`;

    if (shape === "bottle") {
      const ridges = Array.from({ length: 9 }, (_, i) => `<rect x="${73 + i * 6.5}" y="32" width="2" height="24" fill="#000" opacity=".1"/>`).join("");
      return `${shadow}
        <rect x="68" y="28" width="64" height="30" rx="5" fill="${cap}"/>${ridges}
        <rect x="64" y="56" width="72" height="8" rx="2" fill="#e9ebe6"/>
        <path d="M58 76q0-14 14-14h56q14 0 14 14v96q0 13-13 13H71q-13 0-13-13z" fill="${WHITE}" stroke="#000" stroke-opacity=".08"/>
        <rect x="58" y="92" width="84" height="70" fill="${col}"/>
        <text x="100" y="105" class="ps-m" font-size="6.5" letter-spacing="1.4" text-anchor="middle" fill="${ink}" opacity=".85">${brand}</text>
        <text x="100" y="${128 + Math.min(8, fit(p.label, 78, 22)) / 4}" class="ps-d" font-size="${fit(p.label, 78, 22)}" font-weight="700" text-anchor="middle" fill="${ink}">${label}</text>
        <text x="100" y="150" class="ps-b" font-size="7.5" font-weight="600" text-anchor="middle" fill="${ink}" opacity=".92">${sub}</text>
        ${gloss(66, 70, 104)}`;
    }
    if (shape === "tub") {
      return `${shadow}
        <rect x="44" y="56" width="112" height="24" rx="6" fill="${cap}"/>
        <rect x="44" y="74" width="112" height="6" fill="#000" opacity=".12"/>
        <path d="M48 80h104l-5 94q-1 11-12 11H65q-11 0-12-11z" fill="${WHITE}" stroke="#000" stroke-opacity=".08"/>
        <path d="M49.6 98h100.8l-2.9 58H52.5z" fill="${col}"/>
        <text x="100" y="111" class="ps-m" font-size="6.5" letter-spacing="1.4" text-anchor="middle" fill="${ink}" opacity=".85">${brand}</text>
        <text x="100" y="134" class="ps-d" font-size="${fit(p.label, 90, 22)}" font-weight="700" text-anchor="middle" fill="${ink}">${label}</text>
        <text x="100" y="148" class="ps-b" font-size="7.5" font-weight="600" text-anchor="middle" fill="${ink}" opacity=".92">${sub}</text>
        ${gloss(56, 86, 90)}`;
    }
    if (shape === "pouch") {
      const dark = shade(col, -0.45);
      return `${shadow}
        <path d="M54 30h92q5 0 5 5l7 140q0 10-10 10H52q-10 0-10-10l7-140q0-5 5-5z" fill="${col}"/>
        <rect x="49" y="30" width="102" height="14" fill="#000" opacity=".14"/>
        <rect x="50" y="50" width="100" height="2" fill="#000" opacity=".16"/>
        <text x="100" y="68" class="ps-m" font-size="7" letter-spacing="1.6" text-anchor="middle" fill="${ink}" opacity=".9">${brand}</text>
        <rect x="60" y="78" width="80" height="76" rx="6" fill="${WHITE}"/>
        <text x="100" y="110" class="ps-d" font-size="${fit(p.label, 72, 22)}" font-weight="700" text-anchor="middle" fill="${dark}">${label}</text>
        <text x="100" y="126" class="ps-b" font-size="7.5" font-weight="600" text-anchor="middle" fill="${dark}">${sub}</text>
        <rect x="76" y="136" width="48" height="8" rx="4" fill="${col}" opacity=".85"/>
        <text x="100" y="142" class="ps-m" font-size="5.2" text-anchor="middle" fill="${ink}">${esc(p.variants[0].label.toUpperCase())}</text>
        ${gloss(52, 60, 110)}`;
    }
    if (shape === "dropper") {
      const amber = "#7a4a1f";
      return `${shadow}
        <path d="M92 72V46q0-12 8-12t8 12v26z" fill="${shade(col, -0.15)}"/>
        <rect x="85" y="70" width="30" height="18" rx="3" fill="#2a2a28"/>
        <path d="M78 98q0-10 10-12h24q10 2 10 12z" fill="${amber}"/>
        <rect x="70" y="96" width="60" height="88" rx="10" fill="${amber}"/>
        <rect x="70" y="114" width="60" height="52" fill="${WHITE}"/>
        <rect x="70" y="114" width="60" height="7" fill="${col}"/>
        <text x="100" y="131" class="ps-m" font-size="5.2" letter-spacing="1" text-anchor="middle" fill="#3a3a36">${brand}</text>
        <text x="100" y="148" class="ps-d" font-size="${fit(p.label, 54, 15)}" font-weight="700" text-anchor="middle" fill="${shade(col, -0.4)}">${label}</text>
        <text x="100" y="159" class="ps-b" font-size="5.8" font-weight="600" text-anchor="middle" fill="#3a3a36">${sub}</text>
        ${gloss(76, 100, 76)}`;
    }
    if (shape === "liquid") {
      const glass = shade(col, -0.6);
      return `${shadow}
        <rect x="82" y="24" width="36" height="24" rx="4" fill="${cap}"/>
        <rect x="87" y="46" width="26" height="14" fill="${glass}"/>
        <path d="M87 58q-27 6-27 32v82q0 13 13 13h54q13 0 13-13V90q0-26-27-32z" fill="${glass}"/>
        <rect x="60" y="100" width="80" height="64" fill="${col}"/>
        <text x="100" y="113" class="ps-m" font-size="6.5" letter-spacing="1.4" text-anchor="middle" fill="${ink}" opacity=".85">${brand}</text>
        <text x="100" y="136" class="ps-d" font-size="${fit(p.label, 74, 20)}" font-weight="700" text-anchor="middle" fill="${ink}">${label}</text>
        <text x="100" y="153" class="ps-b" font-size="7.5" font-weight="600" text-anchor="middle" fill="${ink}" opacity=".92">${sub}</text>
        ${gloss(67, 80, 96)}`;
    }
    if (shape === "tube") {
      return `${shadow}
        <rect x="76" y="22" width="48" height="22" rx="5" fill="${cap}"/>
        <rect x="80" y="42" width="40" height="142" rx="6" fill="#dfe3df"/>
        <rect x="80" y="64" width="40" height="104" fill="${col}"/>
        <g transform="rotate(-90 100 116)">
          <text x="100" y="105" class="ps-m" font-size="6" letter-spacing="1.2" text-anchor="middle" fill="${ink}" opacity=".85">${brand}</text>
          <text x="100" y="${118 + fit(p.label, 92, 16) / 3}" class="ps-d" font-size="${fit(p.label, 92, 16)}" font-weight="700" text-anchor="middle" fill="${ink}">${label}</text>
          <text x="100" y="132" class="ps-b" font-size="6.5" font-weight="600" text-anchor="middle" fill="${ink}" opacity=".92">${sub}</text>
        </g>
        ${gloss(85, 46, 134)}`;
    }
    if (shape === "bar") {
      const back = shade(col, -0.25);
      return `${shadow}
        <g transform="rotate(-14 100 104)">
          <rect x="34" y="62" width="150" height="50" rx="4" fill="${back}"/>
          <rect x="18" y="92" width="160" height="56" rx="4" fill="${col}"/>
          <rect x="18" y="92" width="10" height="56" fill="#000" opacity=".16"/>
          <rect x="168" y="92" width="10" height="56" fill="#000" opacity=".16"/>
          <text x="98" y="107" class="ps-m" font-size="6.5" letter-spacing="1.4" text-anchor="middle" fill="${ink}" opacity=".85">${brand}</text>
          <text x="98" y="128" class="ps-d" font-size="${fit(p.label, 120, 22)}" font-weight="700" text-anchor="middle" fill="${ink}">${label}</text>
          <text x="98" y="141" class="ps-b" font-size="7.5" font-weight="600" text-anchor="middle" fill="${ink}" opacity=".92">${sub}</text>
        </g>`;
    }
    if (shape === "bundle") {
      const items = (p.bundle || []).slice(0, 3).map(([id]) => S.byId.get(id));
      const pos = [[-6, 30, 112], [94, 30, 112], [38, 52, 128]];
      const minis = items.map((it, i) => `<svg x="${pos[i][0]}" y="${pos[i][1]}" width="${pos[i][2]}" height="${pos[i][2]}" viewBox="0 0 200 200">${packshotInner(it)}</svg>`).join("");
      return `${minis}
        <circle cx="160" cy="40" r="26" fill="${col}"/>
        <text x="160" y="38" class="ps-m" font-size="7" letter-spacing="1" text-anchor="middle" fill="${inkOn(col)}">PAKET</text>
        <text x="160" y="50" class="ps-d" font-size="10" font-weight="700" text-anchor="middle" fill="${inkOn(col)}">${items.length} st</text>`;
    }
    return shadow;
  }
  const packshot = (p, extra = "") => `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(p.name)}" ${extra}>${packshotInner(p)}</svg>`;

  // Bild av dagsdosen (kapslar, skopa, droppar …)
  function doseArt(p) {
    const col = catColor(p);
    const n = Math.max(1, Math.min(6, Math.round(parseFloat(String(p.dose).replace(",", ".")) || 1)));
    const f = p.form;
    let art = "";
    if (["kapslar"].includes(f)) {
      art = Array.from({ length: n }, (_, i) => {
        const x = 100 + (i - (n - 1) / 2) * 34;
        return `<g transform="rotate(-30 ${x} 96)"><rect x="${x - 13}" y="66" width="26" height="60" rx="13" fill="${WHITE}" stroke="#000" stroke-opacity=".15"/><path d="M${x - 13} 96v-17a13 13 0 0 1 26 0v17z" fill="${col}"/></g>`;
      }).join("");
    } else if (["tabletter", "sugtabletter", "tuggtabletter"].includes(f)) {
      art = Array.from({ length: n }, (_, i) => {
        const x = 100 + (i - (n - 1) / 2) * 44;
        return `<ellipse cx="${x}" cy="96" rx="20" ry="20" fill="${WHITE}" stroke="#000" stroke-opacity=".15"/><path d="M${x - 14} 96h28" stroke="#000" stroke-opacity=".15" stroke-width="2"/><ellipse cx="${x}" cy="96" rx="20" ry="20" fill="${col}" opacity=".18"/>`;
      }).join("");
    } else if (f === "gummies") {
      art = Array.from({ length: n }, (_, i) => {
        const x = 100 + (i - (n - 1) / 2) * 46;
        return `<rect x="${x - 18}" y="76" width="36" height="40" rx="12" fill="${col}"/><rect x="${x - 12}" y="80" width="8" height="12" rx="4" fill="#fff" opacity=".35"/>`;
      }).join("");
    } else if (f === "pulver") {
      art = `<ellipse cx="96" cy="92" rx="40" ry="16" fill="${shade(col, -0.2)}"/><path d="M56 92a40 26 0 0 0 80 0" fill="${WHITE}" stroke="#000" stroke-opacity=".15"/><path d="M60 88q36-22 72 0q-36 14-72 0z" fill="${col}" opacity=".55"/><rect x="132" y="86" width="44" height="10" rx="5" fill="${WHITE}" stroke="#000" stroke-opacity=".15"/>`;
    } else if (f === "droppar" || f === "flytande") {
      const drops = f === "droppar" ? n : 1;
      art = f === "flytande"
        ? `<path d="M56 96a44 18 0 0 0 88 0z" fill="${WHITE}" stroke="#000" stroke-opacity=".15"/><ellipse cx="100" cy="96" rx="44" ry="8" fill="${col}" opacity=".7"/><rect x="142" y="91" width="40" height="9" rx="4.5" fill="${WHITE}" stroke="#000" stroke-opacity=".15"/>`
        : Array.from({ length: drops }, (_, i) => {
          const x = 100 + (i - (drops - 1) / 2) * 28;
          return `<path d="M${x} 70c10 14 14 22 14 30a14 14 0 0 1-28 0c0-8 4-16 14-30z" fill="${col}"/>`;
        }).join("");
    } else if (f === "brus") {
      art = `<circle cx="100" cy="96" r="30" fill="${WHITE}" stroke="#000" stroke-opacity=".15"/><circle cx="100" cy="96" r="30" fill="${col}" opacity=".25"/><circle cx="84" cy="62" r="4" fill="${col}" opacity=".5"/><circle cx="118" cy="56" r="3" fill="${col}" opacity=".5"/><circle cx="104" cy="48" r="2" fill="${col}" opacity=".5"/>`;
    } else if (f === "bar") {
      art = `<g transform="rotate(-10 100 96)"><rect x="40" y="78" width="120" height="36" rx="5" fill="${shade(col, -0.35)}"/><rect x="40" y="78" width="120" height="10" rx="5" fill="${col}"/></g>`;
    } else {
      return packshot(p);
    }
    return `<svg viewBox="0 0 200 200" role="img" aria-label="Dagsdos: ${esc(p.dose)}">${art}
      <text x="100" y="156" class="ps-m" font-size="9" letter-spacing="1.5" text-anchor="middle" fill="currentColor" opacity=".6">DAGSDOS</text>
      <text x="100" y="176" class="ps-d" font-size="16" font-weight="700" text-anchor="middle" fill="currentColor">${esc(p.dose)}</text></svg>`;
  }

  /* ---------- Små komponenter ---------- */
  function stars(rating, label = true) {
    const full = Math.round(rating * 2) / 2;
    const s = Array.from({ length: 5 }, (_, i) => icon("star", i < Math.round(full) ? "" : "off")).join("");
    return `<span class="stars" ${label ? `role="img" aria-label="${S.num(rating)} av 5 stjärnor"` : 'aria-hidden="true"'}>${s}</span>`;
  }
  const rating = (p) => `<span class="rating">${stars(p.rating)} <span class="num">${S.num(p.rating)}</span> <span>(${S.num(p.reviews)})</span></span>`;

  function badges(p) {
    const out = [];
    const sale = p.variants.find((v) => v.was && v.was > v.price);
    if (sale) out.push(`<span class="pill pill--sale">−${Math.round((1 - sale.price / sale.was) * 100)} %</span>`);
    if (p.campaign === "3for2") out.push(`<span class="pill pill--sale">3 för 2</span>`);
    if (S.isNew(p)) out.push(`<span class="pill pill--new">Nyhet</span>`);
    if (p.badges.includes("bastsaljare")) out.push(`<span class="pill pill--best">Bästsäljare</span>`);
    return out.slice(0, 2).join("");
  }

  function dietTags(p, max = 3) {
    return p.diets.slice(0, max).map((d) => `<span class="diet">${d === "vegan" ? icon("leaf", "ico--sm") : ""}${esc(S.dietById.get(d).name)}</span>`).join("");
  }

  function cardPrice(p) {
    const v = p.variants[0];
    const many = new Set(p.variants.map((x) => x.price)).size > 1;
    const u = S.unitPrices(p, v);
    return `<div class="price">
      <span class="price__now ${v.was ? "is-sale" : ""}">${many ? '<span style="font-size:.7em;font-weight:500">fr. </span>' : ""}${S.money(v.price)}</span>
      ${v.was ? `<span class="price__was">${S.money(v.was)}</span>` : ""}
      ${u.perDose ? `<span class="price__unit">${S.money2(u.perDose)}/dagsdos</span>` : ""}
    </div>`;
  }

  function card(p) {
    const fav = S.state.favorites.includes(p.id);
    const cmp = S.state.compare.includes(p.id);
    const st = S.stockState(p);
    const v = p.variants[0];
    return `<article class="card" style="--c:${catColor(p)}">
      <div class="card__badges">${badges(p)}</div>
      <button class="icon-btn card__fav" type="button" data-action="fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? "Ta bort från favoriter" : "Spara som favorit"}: ${esc(p.name)}">${icon(fav ? "heart-fill" : "heart")}</button>
      <div class="card__media">${packshot(p, 'aria-hidden="true"')}</div>
      <div class="card__body">
        <span class="card__brand">${esc(S.brandById.get(p.brand).name)}</span>
        <a class="card__name" href="#/produkt/${p.slug}">${esc(p.name)}</a>
        <span class="card__spec">${esc(v.label)}${p.variants.length > 1 ? ` · ${p.variants.length} storlekar` : ""}${p.flavors && p.flavors.length > 1 ? ` · ${p.flavors.length} smaker` : ""}</span>
        ${rating(p)}
        ${st === "low" ? `<span class="stock-low">Endast ${p.stock} kvar</span>` : ""}
        <div class="card__foot">
          ${cardPrice(p)}
          ${st === "out"
            ? `<a class="btn btn--ghost btn--sm card__add" href="#/produkt/${p.slug}">Bevaka</a>`
            : `<button class="btn btn--primary btn--sm card__add" type="button" data-action="add" data-id="${p.id}" aria-label="Lägg ${esc(p.name)} i varukorgen">${icon("plus", "ico--sm")} Köp</button>`}
        </div>
        <label class="card__compare"><input type="checkbox" data-action="compare" data-id="${p.id}" ${cmp ? "checked" : ""}> Jämför</label>
      </div>
    </article>`;
  }

  const grid = (list, cls = "") => `<div class="product-grid ${cls}">${list.map(card).join("")}</div>`;
  function rail(id, title, list, sub = "", link = "") {
    if (!list.length) return "";
    return `<section class="section container" aria-labelledby="${id}-h">
      <div class="section__head">
        <div><h2 id="${id}-h">${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>
        <div class="rail-nav">${link}<button type="button" data-action="rail" data-dir="-1" data-target="${id}" aria-label="Föregående">${icon("chevron")}</button><button type="button" data-action="rail" data-dir="1" data-target="${id}" aria-label="Nästa">${icon("chevron")}</button></div>
      </div>
      <div class="rail" id="${id}">${list.map(card).join("")}</div>
    </section>`;
  }

  function crumbs(items) {
    return `<nav class="crumbs container" aria-label="Brödsmulor"><ol>${items.map((it, i) =>
      i === items.length - 1 ? `<li><span aria-current="page">${esc(it[0])}</span></li>` : `<li><a href="${it[1]}">${esc(it[0])}</a></li>`).join("")}</ol></nav>`;
  }

  function nutritionTable(p) {
    const n = p.nutrition;
    if (!n) {
      return `<p>Paketet innehåller:</p><ul class="claims">${(p.bundle || []).map(([id, vid]) => {
        const it = S.byId.get(id);
        return `<li>${icon("check")}<span><a class="link" href="#/produkt/${it.slug}">${esc(it.name)}</a> – ${esc(S.getVariant(it, vid).label)}</span></li>`;
      }).join("")}</ul>`;
    }
    if (n.macro) {
      return `<div class="nutri-wrap"><table class="nutri">
        <caption>Näringsvärde</caption>
        <thead><tr><th scope="col"></th>${n.macro.cols.map((c) => `<th scope="col">Per ${esc(c)}</th>`).join("")}</tr></thead>
        <tbody>${n.macro.rows.map((r) => `<tr class="${r[3] ? "sub" : ""}"><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody>
      </table></div>`;
    }
    const rows = S.nutritionRows(p);
    return `<div class="nutri-wrap"><table class="nutri">
      <caption>Innehåll per dagsdos</caption>
      <thead><tr><th scope="col">${esc(n.per)}</th><th scope="col">Mängd</th><th scope="col">%RI*</th></tr></thead>
      <tbody>${rows.map((r) => `<tr class="${r.sub ? "sub" : ""}"><td>${esc(r.name.replace(/^varav /, r.sub ? "varav " : ""))}</td><td>${esc(r.amount)}</td><td>${r.ri == null ? "**" : S.num(r.ri) + " %"}</td></tr>`).join("")}</tbody>
      <tfoot><tr><td colspan="3">* %RI = procent av referensintaget för vuxna. ** Referensintag saknas.</td></tr></tfoot>
    </table></div>`;
  }

  function empty(title, text, cta = "") {
    return `<div class="empty">${icon("search", "ico--lg")}<h2>${title}</h2><p>${text}</p>${cta}</div>`;
  }

  /* ---------- Rekommendationer ---------- */
  const inStock = (p) => p.stock > 0;
  function related(p, n = 8) {
    return S.products.filter((x) => x.id !== p.id && x.cat === p.cat && inStock(x)).sort((a, b) => b.sold - a.sold).slice(0, n);
  }
  function complements(p, n = 2) {
    return S.products
      .filter((x) => x.id !== p.id && x.cat !== p.cat && x.form !== "paket" && inStock(x) && x.goals.some((g) => p.goals.includes(g)))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, n);
  }
  function crossSell(n = 4) {
    const inCart = new Set(S.state.cart.map((i) => i.productId));
    const goals = new Set(S.state.cart.flatMap((i) => S.byId.get(i.productId).goals));
    const cats = new Set(S.state.cart.map((i) => S.byId.get(i.productId).cat));
    return S.products
      .filter((x) => !inCart.has(x.id) && inStock(x) && x.form !== "paket")
      .map((x) => ({ x, s: x.sold / 1000 + (x.goals.some((g) => goals.has(g)) ? 10 : 0) - (cats.has(x.cat) ? 4 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, n)
      .map((r) => r.x);
  }

  /* ---------- Recensioner (exempeltext i demobutiken) ---------- */
  const NAMES = ["Anna L.", "Johan S.", "Maria K.", "Erik N.", "Sara B.", "Karin H.", "Lars P.", "Emma W.", "Oskar R.", "Linnea F.", "Ahmed M.", "Fatima A.", "Mikael J.", "Elin Ö.", "Nils G.", "Hanna D.", "Ali K.", "Sofia T.", "Jonas E.", "Ida M.", "Petra Å.", "Viktor L."];
  const TEXTS = {
    5: [["Blir inte utan", "Har tagit dem i flera månader och kommer att fortsätta."], ["Precis som utlovat", "Tydlig innehållsförteckning och doser i klartext. Det uppskattar jag."], ["Köper igen", "Tredje gången jag beställer. Snabb leverans och bra pris med prenumerationen."], ["Rekommenderas", "Tipsade min sambo som också har börjat. Inga magbesvär alls."]],
    4: [["Bra produkt", "Gör det den ska. Hade gärna sett en större förpackning."], ["Prisvärt", "Bättre pris per dagsdos än det jag köpte förut. Leveransen tog två dagar."], ["Nöjd", "Fungerar bra för mig, men förpackningen är lite större än den behöver vara."]],
    3: [["Okej", "Inget fel på produkten, men jag märker ingen större skillnad mot mitt gamla märke."], ["Helt okej", "Svårt att säga något om effekten, men den är lätt att ta och prisvärd."]],
    2: [["Inte för mig", "Fick lite ont i magen de första dagarna och slutade."]],
    1: [["Kom skadad", "Förpackningen var trasig vid leverans. Kundservice skickade en ny direkt, men ändå."]]
  };
  const FORM_TEXT = {
    bottle: "Lätta att svälja och ingen eftersmak.", tub: "Löser sig fint och smakar bra.", pouch: "Löser sig utan klumpar och smaken är riktigt god.",
    dropper: "Smidigt att dosera.", liquid: "Ingen fiskig eftersmak, vilket var min största oro.", tube: "Smakar gott och löser sig snabbt.",
    bar: "Godare än de flesta bars jag har testat.", bundle: "Smidigt att få allt i ett paket."
  };
  function distribution(r) {
    const d = r - 4.3;
    const s = [0.55 + d * 0.54, 0.27 - d * 0.3, 0.11 - d * 0.14, 0.04 - d * 0.06].map((x) => Math.max(0.002, x));
    const s1 = Math.max(0.002, 1 - s.reduce((a, b) => a + b, 0));
    return { 5: s[0], 4: s[1], 3: s[2], 2: s[3], 1: s1 };
  }
  function reviewsFor(p) {
    const rand = S.rng(p.id);
    const dist = distribution(p.rating);
    let shape = S.forms[p.form].shape;
    if (shape === "tub" && p.variants[0].g >= 750) shape = "pouch";
    const pick = () => { const x = rand(); let acc = 0; for (const k of [5, 4, 3, 2, 1]) { acc += dist[k]; if (x <= acc) return k; } return 5; };
    const list = Array.from({ length: 6 }, (_, i) => {
      const r = i < 3 ? (rand() < 0.75 ? 5 : 4) : pick();
      const pool = TEXTS[r];
      const [title, body] = pool[Math.floor(rand() * pool.length)];
      const date = new Date(Date.now() - Math.floor(rand() * 300 + 2) * 864e5);
      return { name: NAMES[Math.floor(rand() * NAMES.length)], rating: r, title, body: r >= 4 ? `${body} ${FORM_TEXT[shape]}` : body, date: date.toISOString(), verified: rand() > 0.15, helpful: Math.floor(rand() * 40), flavor: p.flavors ? p.flavors[Math.floor(rand() * p.flavors.length)] : null };
    });
    const own = (S.state.reviews[p.id] || []).map((r) => ({ ...r, own: true }));
    return { list: [...own, ...list], dist, own };
  }

  /* ---------- Toasts ---------- */
  function toast(msg, opts = {}) {
    const box = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${icon(opts.icon || "check")}<span>${msg}</span>${opts.action ? `<button type="button">${esc(opts.action.label)}</button>` : ""}`;
    if (opts.action) el.querySelector("button").addEventListener("click", () => { opts.action.fn(); el.remove(); });
    box.appendChild(el);
    setTimeout(() => el.remove(), opts.duration || 4200);
  }

  /* ---------- Lådor (varukorg, meny, filter) ---------- */
  let lastFocus = null;
  function openDrawer(el, trigger) {
    closeDrawers(false);
    lastFocus = trigger || document.activeElement;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    $("#overlay").hidden = false;
    document.body.style.overflow = "hidden";
    $$(`[aria-controls="${el.id}"]`).forEach((b) => b.setAttribute("aria-expanded", "true"));
    setTimeout(() => el.focus(), 30);
  }
  function closeDrawers(restore = true) {
    const open = $$(".drawer.is-open, .filters.is-open");
    open.forEach((el) => {
      el.classList.remove("is-open");
      if (el.classList.contains("drawer")) el.setAttribute("aria-hidden", "true");
      $$(`[aria-controls="${el.id}"]`).forEach((b) => b.setAttribute("aria-expanded", "false"));
    });
    $("#overlay").hidden = true;
    document.body.style.overflow = "";
    if (restore && open.length && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  window.UI = {
    $, $$, esc, icon, plural, fmtDay, fmtDate, catColor, shade, inkOn,
    packshot, packshotInner, doseArt, stars, rating, badges, dietTags, card, grid, rail, crumbs, nutritionTable, empty,
    related, complements, crossSell, reviewsFor, toast, openDrawer, closeDrawers
  };
})();
