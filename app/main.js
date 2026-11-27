// FridayFind — renders the deal board, search, filters and sorting.
// All deal data lives in deals.js; this file only reads it and draws the page.
// Filter state is mirrored in the URL (?q=&cat=&store=&min=&sort=&genuine=1)
// so a filtered view can be linked to, reloaded, and screenshotted as-is.

import { deals, CHECKED_LABEL } from "./deals.js";

const SIGNALS = {
  low: { label: "Genuine low", cls: "v-low", rank: 4 },
  strong: { label: "Strong price", cls: "v-strong", rank: 3 },
  solid: { label: "Solid cut", cls: "v-solid", rank: 2 },
  modest: { label: "Modest cut", cls: "v-modest", rank: 1 },
  fineprint: { label: "Read the fine print", cls: "v-fineprint", rank: 0 },
};

const grid = document.getElementById("deal-grid");
const countLine = document.getElementById("result-count");
const topPicks = document.getElementById("top-picks");
const searchBox = document.getElementById("search");
const categorySel = document.getElementById("category");
const storeSel = document.getElementById("store");
const discountSel = document.getElementById("min-discount");
const sortSel = document.getElementById("sort");
const genuineBox = document.getElementById("genuine-only");
const resetBtn = document.getElementById("reset-filters");

const state = {
  q: "",
  category: "All",
  store: "All",
  minDiscount: 0,
  sort: "discount",
  genuineOnly: false,
};

function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function discountPct(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

function saving(d) {
  return d.was - d.price;
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fillSelect(select, values, allLabel) {
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  }
  select.insertAdjacentHTML("afterbegin", `<option value="All">${allLabel}</option>`);
}

function cardHtml(d) {
  const v = SIGNALS[d.signal];
  const pct = discountPct(d);
  return `<article class="deal" data-id="${esc(d.id)}">
    <div class="deal-top">
      <span class="store">${esc(d.store)}</span>
      <span class="cat">${esc(d.category)}</span>
      <span class="pct">-${pct}%</span>
    </div>
    <h3>${esc(d.title)}</h3>
    <p class="detail">${esc(d.detail)}</p>
    <p class="prices"><span class="now">${money(d.price)}</span> <span class="was">${money(d.was)}</span> <span class="save">save ${money(saving(d))}</span></p>
    <p class="signal ${v.cls}">${v.label}</p>
    <p class="note">${esc(d.note)}</p>
    <p class="meta">Checked ${esc(CHECKED_LABEL)} · Source: ${esc(d.source)}</p>
    <a class="cta" href="${esc(d.url)}" target="_blank" rel="noopener">View at ${esc(d.store)} ↗</a>
  </article>`;
}

function applyFilters(list) {
  const q = state.q.trim().toLowerCase();
  return list.filter((d) => {
    if (q && !(d.title + " " + d.detail + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (discountPct(d) < state.minDiscount) return false;
    if (state.genuineOnly && d.signal !== "low") return false;
    return true;
  });
}

function applySort(list) {
  const sorted = [...list];
  if (state.sort === "discount") sorted.sort((a, b) => discountPct(b) - discountPct(a) || saving(b) - saving(a));
  else if (state.sort === "saving") sorted.sort((a, b) => saving(b) - saving(a));
  else if (state.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (state.sort === "signal") sorted.sort((a, b) => SIGNALS[b.signal].rank - SIGNALS[a.signal].rank || discountPct(b) - discountPct(a));
  return sorted;
}

function renderTopPicks() {
  // Top picks follow the active filters, so a filtered view never shows
  // picks that the filter itself hides.
  const scope = applyFilters(deals);
  const picks = [...scope]
    .filter((d) => d.signal === "low" || d.signal === "strong")
    .sort((a, b) => discountPct(b) - discountPct(a))
    .slice(0, 3);
  const heading = document.getElementById("picks-heading");
  const section = document.getElementById("picks-section");
  const scopeName =
    state.category !== "All"
      ? state.category
      : state.store !== "All"
        ? state.store
        : state.q.trim()
          ? `“${state.q.trim()}”`
          : "";
  heading.textContent = scopeName
    ? `Top picks in ${scopeName} — the steepest genuine deals`
    : "Top picks — the three steepest genuine deals";
  section.style.display = picks.length ? "" : "none";
  if (!picks.length) {
    topPicks.innerHTML = "";
    return;
  }
  topPicks.innerHTML = picks
    .map(
      (d) =>
        `<a class="pick" href="#${esc(d.id)}" data-pick="${esc(d.id)}"><span class="pick-pct">-${discountPct(d)}%</span><span class="pick-title">${esc(d.title)}</span><span class="pick-price">${money(d.price)} <s>${money(d.was)}</s> · ${esc(d.store)}</span></a>`,
    )
    .join("");
  topPicks.querySelectorAll("[data-pick]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      const card = grid.querySelector(`[data-id="${el.dataset.pick}"]`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function render() {
  renderTopPicks();
  const filtered = applySort(applyFilters(deals));
  countLine.textContent =
    filtered.length === deals.length
      ? `Showing all ${deals.length} verified deals`
      : `Showing ${filtered.length} of ${deals.length} verified deals`;
  grid.innerHTML = filtered.length
    ? filtered.map(cardHtml).join("")
    : `<p class="empty">No deals match those filters. <button id="clear-filters" type="button">Clear all filters</button></p>`;
  const clearBtn = document.getElementById("clear-filters");
  if (clearBtn) clearBtn.addEventListener("click", resetFilters);
  syncUrl();
}

function syncUrl() {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category !== "All") params.set("cat", state.category);
  if (state.store !== "All") params.set("store", state.store);
  if (state.minDiscount) params.set("min", String(state.minDiscount));
  if (state.sort !== "discount") params.set("sort", state.sort);
  if (state.genuineOnly) params.set("genuine", "1");
  const qs = params.toString();
  history.replaceState(null, "", qs ? "?" + qs : location.pathname);
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  state.q = params.get("q") || "";
  state.category = params.get("cat") || "All";
  state.store = params.get("store") || "All";
  state.minDiscount = Number(params.get("min") || 0);
  state.sort = params.get("sort") || "discount";
  state.genuineOnly = params.get("genuine") === "1";
  searchBox.value = state.q;
  categorySel.value = state.category;
  storeSel.value = state.store;
  discountSel.value = String(state.minDiscount);
  sortSel.value = state.sort;
  genuineBox.checked = state.genuineOnly;
}

function resetFilters() {
  state.q = "";
  state.category = "All";
  state.store = "All";
  state.minDiscount = 0;
  state.sort = "discount";
  state.genuineOnly = false;
  searchBox.value = "";
  categorySel.value = "All";
  storeSel.value = "All";
  discountSel.value = "0";
  sortSel.value = "discount";
  genuineBox.checked = false;
  render();
}

function renderStats() {
  const stores = new Set(deals.map((d) => d.store)).size;
  const maxPct = Math.max(...deals.map(discountPct));
  const lows = deals.filter((d) => d.signal === "low").length;
  document.getElementById("stat-deals").textContent = String(deals.length);
  document.getElementById("stat-stores").textContent = String(stores);
  document.getElementById("stat-max").textContent = "-" + maxPct + "%";
  document.getElementById("stat-lows").textContent = String(lows);
  document.getElementById("checked-label").textContent = CHECKED_LABEL;
}

searchBox.addEventListener("input", () => {
  state.q = searchBox.value;
  render();
});
categorySel.addEventListener("change", () => {
  state.category = categorySel.value;
  render();
});
storeSel.addEventListener("change", () => {
  state.store = storeSel.value;
  render();
});
discountSel.addEventListener("change", () => {
  state.minDiscount = Number(discountSel.value);
  render();
});
sortSel.addEventListener("change", () => {
  state.sort = sortSel.value;
  render();
});
genuineBox.addEventListener("change", () => {
  state.genuineOnly = genuineBox.checked;
  render();
});
resetBtn.addEventListener("click", resetFilters);

fillSelect(categorySel, [...new Set(deals.map((d) => d.category))].sort(), "All categories");
fillSelect(storeSel, [...new Set(deals.map((d) => d.store))].sort(), "All stores");
readUrl();
renderStats();
render();
