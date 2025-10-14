// Shared data
let OFFERS = {};      // loaded from /offers.json
let NETWORKS = {};    // loaded from /networks.json
let CURRENT_MARKET = 'AU';
let CURRENT_CATEGORY = null;

// Load networks & offers, then render
(async function init() {
  try {
    const [netRes, offRes] = await Promise.all([
      fetch('/networks.json', { cache: 'no-cache' }),
      fetch('/offers.json',   { cache: 'no-cache' })
    ]);
    NETWORKS = await netRes.json();
    OFFERS   = await offRes.json();

    // Default selections
    const markets = Object.keys(OFFERS);
    if (markets.length) CURRENT_MARKET = markets.includes('AU') ? 'AU' : markets[0];
    const cats = Object.keys(OFFERS[CURRENT_MARKET] || {});
    CURRENT_CATEGORY = cats[0] || null;

    renderMarketTabs();
    renderCategoryTabs();
    renderOffers();
  } catch (e) {
    console.error('Init failed:', e);
    document.getElementById('offersGrid').innerHTML = `<div class="card">No offers available.</div>`;
  }
})();

function renderMarketTabs() {
  const el = document.getElementById('marketTabs');
  const markets = Object.keys(OFFERS || {});
  el.innerHTML = markets.map(m => `
    <button class="pill ${m===CURRENT_MARKET?'active':''}" onclick="setMarket('${m}')">${m}</button>
  `).join('') || '<span>No markets</span>';
}

function setMarket(m) {
  CURRENT_MARKET = m;
  const cats = Object.keys(OFFERS[CURRENT_MARKET] || {});
  CURRENT_CATEGORY = cats[0] || null;
  renderMarketTabs();
  renderCategoryTabs();
  renderOffers();
}

function renderCategoryTabs() {
  const el = document.getElementById('categoryTabs');
  const cats = Object.keys(OFFERS[CURRENT_MARKET] || {});
  el.innerHTML = cats.map(c => `
    <button class="pill ${c===CURRENT_CATEGORY?'active':''}" onclick="setCategory('${c.replace(/'/g,"\\'")}')">${c}</button>
  `).join('') || '<span>No categories</span>';
}

function setCategory(c) {
  CURRENT_CATEGORY = c;
  renderCategoryTabs();
  renderOffers();
}

function renderOffers() {
  const grid = document.getElementById('offersGrid');
  const list = (OFFERS[CURRENT_MARKET] && OFFERS[CURRENT_MARKET][CURRENT_CATEGORY]) || [];
  if (!CURRENT_CATEGORY) {
    grid.innerHTML = `<div class="card">Select a category.</div>`;
    return;
  }
  if (!list.length) {
    grid.innerHTML = `<div class="card">No offers in <b>${CURRENT_CATEGORY}</b> yet.</div>`;
    return;
  }
  grid.innerHTML = list.map(o => `
    <article class="card">
      <h3 style="margin:0 0 6px 0;">${escapeHtml(o.name)}</h3>
      <div style="font-size:12px;opacity:.8;margin-bottom:8px;">
        ${o.payout ? `Payout: ${escapeHtml(o.payout)} · ` : ''}${o.status || 'Active'}
      </div>
      <button class="btn" onclick='onOfferClick(${JSON.stringify(o).replace(/'/g,"&#39;")})'>Get Deal</button>
    </article>
  `).join('');
}

// Tracking helpers
function getUserRef() {
  let id = localStorage.getItem('pp_user_ref');
  if (!id) {
    id = 'u_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('pp_user_ref', id);
  }
  return id;
}

function buildTrackedUrl(baseUrl, networkKey, userRef) {
  const net = NETWORKS[networkKey];
  const paramName = net?.param || 'ref';
  const glue = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${glue}${encodeURIComponent(paramName)}=${encodeURIComponent(userRef)}`;
}

function onOfferClick(offer) {
  const baseUrl = offer.baseUrl || offer.url || '';
  if (!baseUrl) return;
  const userRef = getUserRef();
  const url = buildTrackedUrl(baseUrl, offer.network, userRef);
  // TODO: optional analytics ping here
  window.open(url, '_blank');
}

// utils
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, r => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[r]));
}
