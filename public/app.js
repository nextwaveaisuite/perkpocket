// PerkPocket public app — load offers and append correct tracking
(() => {
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const offersEl = $("#offers");
  const searchEl = $("#search");
  const yrEl = $("#yr");

  if (yrEl) yrEl.textContent = new Date().getFullYear();

  let networks = {};
  let offers = [];

  async function loadData() {
    const [netRes, offRes] = await Promise.all([
      fetch("networks.json"),
      fetch("offers.json")
    ]);
    networks = await netRes.json();
    offers = await offRes.json();
    render(offers);
  }

  function buildTrackedUrl(offer) {
    const net = networks[offer.network];
    if (!net) return offer.url;

    const url = new URL(offer.url);
    // Append required tracking params, preserving existing ones
    Object.entries(net.params || {}).forEach(([k,v]) => {
      if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    });

    // Optional subId (clickref, etc.) — derive from offer or fallback
    if (net.subParam) {
      const subVal = offer.subId || "perkpocket";
      if (!url.searchParams.has(net.subParam)) url.searchParams.set(net.subParam, subVal);
    }
    return url.toString();
  }

  function card(offer) {
    const tracked = buildTrackedUrl(offer);
    return `
      <article class="card">
        <span class="brand-chip">${offer.network}</span>
        <h4>${offer.title}</h4>
        <p>${offer.blurb}</p>
        <div class="meta">
          ${offer.category ? `<span class="pill">${offer.category}</span>` : ""}
          ${offer.region ? `<span class="pill">${offer.region}</span>` : ""}
          ${offer.perk ? `<span class="pill">${offer.perk}</span>` : ""}
          ${offer.fee ? `<span class="pill">Fee ${offer.fee}</span>` : ""}
        </div>
        <div class="actions">
          <a class="link" href="${tracked}" target="_blank" rel="nofollow noopener">Get Offer</a>
          ${offer.info ? `<a class="link secondary" href="${offer.info}" target="_blank">Info</a>` : ""}
        </div>
      </article>
    `;
  }

  function render(list) {
    if (!list?.length) {
      offersEl.innerHTML = `<div class="card"><h4>No offers found</h4><p>Try another keyword or category.</p></div>`;
      return;
    }
    offersEl.innerHTML = list.map(card).join("");
  }

  function byCategory(cat) {
    render(offers.filter(o => (o.category||"").toLowerCase().includes(cat.toLowerCase())));
  }

  function onSearch() {
    const q = (searchEl?.value || "").trim().toLowerCase();
    if (!q) { render(offers); return; }
    const list = offers.filter(o => {
      return [o.title,o.blurb,o.category,o.region,o.perk]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q));
    });
    render(list);
  }

  $("#searchBtn")?.addEventListener("click", onSearch);
  searchEl?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") onSearch(); });
  $$(".cat-card").forEach(el => el.addEventListener("click", () => byCategory(el.dataset.cat)));

  if (offersEl) {
    loadData().catch(err => {
      offersEl.innerHTML = `<div class="card"><h4>Load error</h4><p>${err?.message||err}</p></div>`;
    });
  }
})();
