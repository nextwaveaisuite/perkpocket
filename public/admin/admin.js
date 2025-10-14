// admin.js — full admin console (no visual overrides; inherits /style.css)

// ===== Password (pre-filled per your request) =====
const ADMIN_PASSWORD = "1Church@Miles_St_MountIsa";

// ===== State =====
const state = {
  data: null,          // offers.json content
  market: "AU",        // active market
  category: null,      // active category
  dirty: false,        // unsaved changes flag
  networks: {}         // networks.json
};

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// ===== Bootstrap =====
(async function init() {
  if (sessionStorage.getItem("perkAdminAuth") === "granted") {
    await initApp();
  } else {
    renderLogin();
  }
})();

// ===== Views =====
function renderLogin() {
  $('#app').innerHTML = `
    <div class="container" style="max-width: 420px; margin: 64px auto;">
      <div class="card" style="padding: 16px;">
        <h2 style="margin:0 0 12px;">PerkPocket Admin Login</h2>
        <input id="pw" type="password" placeholder="Enter Admin Password" />
        <div style="margin-top: 12px;">
          <button id="loginBtn" class="btn btn-primary">Login</button>
        </div>
      </div>
    </div>
  `;
  $('#loginBtn').addEventListener('click', checkLogin);
}

function layoutRoot() {
  $('#app').innerHTML = `
    <div class="container" style="max-width: 1100px; margin: 24px auto;">
      <div class="header" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <h1 style="margin:0;">PerkPocket Admin</h1>
        <div>
          <span id="savePill" class="pill">${state.dirty ? 'Unsaved changes' : 'All changes saved'}</span>
          <input type="file" id="importFile" accept="application/json" style="display:none" />
          <button id="importBtn" class="btn">Import JSON</button>
          <button id="exportBtn" class="btn">Export JSON</button>
          <button id="logoutBtn" class="btn btn-danger">Logout</button>
        </div>
      </div>

      <div style="display:flex; gap:16px; margin-top:16px;">
        <div class="card" style="flex:1; padding: 16px;">
          <h3>Market</h3>
          <select id="marketSelect"></select>

          <h3 style="margin-top:16px;">Category</h3>
          <select id="categorySelect"></select>

          <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
            <button id="addCategoryBtn" class="btn">+ Add Category</button>
            <button id="renameCategoryBtn" class="btn">Rename</button>
            <button id="deleteCategoryBtn" class="btn btn-danger">Delete</button>
          </div>
        </div>

        <div class="card" style="flex:2; padding: 16px;">
          <h3 id="offersTitle">Offers</h3>
          <div id="offersTable"></div>
          <div style="margin-top:10px;">
            <button id="addOfferBtn" class="btn">+ Add Offer</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // bind header buttons
  $('#logoutBtn').addEventListener('click', logout);
  $('#exportBtn').addEventListener('click', exportJSON);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', importJSON);
}

async function initApp() {
  layoutRoot();
  await loadData();
  renderSelectors();
  renderOffersTable();
}

async function loadData() {
  try {
    const [netRes, offRes] = await Promise.all([
      fetch('/networks.json', { cache: 'no-cache' }),
      fetch('/offers.json',   { cache: 'no-cache' })
    ]);
    state.networks = await netRes.json();
    state.data = await offRes.json();
    // default category
    const cats = Object.keys(state.data[state.market] || {});
    state.category = cats[0] || null;
  } catch (e) {
    console.error('Load data error:', e);
    state.networks = {};
    state.data = { AU: {}, UK: {} };
    state.category = null;
  }
}

function renderSelectors() {
  const marketSel = $('#marketSelect');
  const categorySel = $('#categorySelect');

  // markets
  const markets = Object.keys(state.data || {});
  marketSel.innerHTML = markets.map(m => `<option value="${m}" ${m===state.market?'selected':''}>${m}</option>`).join('');
  marketSel.onchange = e => {
    state.market = e.target.value;
    const cats = Object.keys(state.data[state.market] || {});
    state.category = cats[0] || null;
    renderSelectors();
    renderOffersTable();
  };

  // categories
  const cats = Object.keys(state.data[state.market] || {});
  categorySel.innerHTML = cats.length ? cats.map(c => `<option value="${c}" ${c===state.category?'selected':''}>${c}</option>`).join('') : `<option>(none)</option>`;
  categorySel.onchange = e => {
    state.category = e.target.value;
    renderOffersTable();
  };

  // category buttons
  $('#addCategoryBtn').onclick = addCategory;
  $('#renameCategoryBtn').onclick = renameCategory;
  $('#deleteCategoryBtn').onclick = deleteCategory;

  // title
  $('#offersTitle').textContent = `Offers — ${state.market}${state.category ? ' • ' + state.category : ''}`;
}

function renderOffersTable() {
  const wrap = $('#offersTable');
  const list = (state.data[state.market] && state.data[state.market][state.category]) || [];

  if (!state.category) {
    wrap.innerHTML = `<p>No category selected. Add or select one at left.</p>`;
    return;
  }
  if (!list.length) {
    wrap.innerHTML = `<p>No offers yet in <b>${escapeHtml(state.category)}</b>. Click “+ Add Offer”.</p>`;
    return;
  }

  const networkOptions = Object.entries(state.networks)
    .map(([k, v]) => `<option value="${k}">${escapeHtml(v.name || k)}</option>`)
    .join('');

  wrap.innerHTML = `
    <div class="table-wrap" style="overflow:auto;">
      <table class="table">
        <thead>
          <tr>
            <th>Offer Name</th>
            <th>Base Affiliate URL</th>
            <th>Network</th>
            <th>Payout</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((o, i) => `
            <tr>
              <td><input type="text" value="${escapeHtml(o.name)}" data-i="${i}" data-f="name" /></td>
              <td><input type="text" value="${escapeHtml(o.baseUrl || o.url || '')}" placeholder="Paste your full affiliate link" data-i="${i}" data-f="baseUrl" /></td>
              <td>
                <select data-i="${i}" data-f="network">
                  ${Object.entries(state.networks).map(([k, v]) =>
                    `<option value="${k}" ${o.network === k ? 'selected' : ''}>${escapeHtml(v.name || k)}</option>`
                  ).join('')}
                </select>
              </td>
              <td><input type="text" value="${escapeHtml(o.payout || '')}" data-i="${i}" data-f="payout" /></td>
              <td>
                <select data-i="${i}" data-f="status">
                  ${['Active', 'Pending', 'Paused'].map(s =>
                    `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
                  ).join('')}
                </select>
              </td>
              <td>
                <button class="btn" data-act="preview" data-i="${i}">Preview</button>
                <button class="btn btn-danger" data-act="delete" data-i="${i}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // bind inputs
  wrap.querySelectorAll('input, select').forEach(el => {
    const i = +el.dataset.i;
    const f = el.dataset.f;
    if (!Number.isFinite(i) || !f) return;

    el.addEventListener('input', e => {
      state.data[state.market][state.category][i][f] = e.target.value;
      markDirty();
    });
    el.addEventListener('change', e => {
      state.data[state.market][state.category][i][f] = e.target.value;
      markDirty();
    });
  });

  // bind buttons
  wrap.querySelectorAll('button[data-act]').forEach(btn => {
    const i = +btn.dataset.i;
    const act = btn.dataset.act;
    btn.onclick = () => {
      if (act === 'preview') previewOffer(i);
      if (act === 'delete') removeOffer(i);
    };
  });

  // add offer button
  $('#addOfferBtn').onclick = addOffer;
}

function addCategory() {
  const name = prompt('New category name:');
  if (!name) return;
  state.data[state.market] = state.data[state.market] || {};
  if (!state.data[state.market][name]) state.data[state.market][name] = [];
  state.category = name;
  markDirty();
  renderSelectors();
  renderOffersTable();
}

function renameCategory() {
  if (!state.category) return alert('No category selected.');
  const next = prompt('Rename category:', state.category);
  if (!next || next === state.category) return;
  const list = state.data[state.market][state.category];
  delete state.data[state.market][state.category];
  state.data[state.market][next] = list;
  state.category = next;
  markDirty();
  renderSelectors();
  renderOffersTable();
}

function deleteCategory() {
  if (!state.category) return alert('No category selected.');
  if (!confirm(`Delete category "${state.category}" and all its offers?`)) return;
  delete state.data[state.market][state.category];
  const cats = Object.keys(state.data[state.market] || {});
  state.category = cats[0] || null;
  markDirty();
  renderSelectors();
  renderOffersTable();
}

function addOffer() {
  if (!state.category) return alert('Create or select a category first.');
  const name = prompt('Offer name:');
  const baseUrl = prompt('Offer URL (your affiliate link):');
  const network = prompt('Network key (e.g., awin, cj, impact):', 'awin') || 'awin';
  if (!name || !baseUrl) return;
  state.data[state.market][state.category].push({
    name, baseUrl, network, payout: '', status: 'Active'
  });
  markDirty();
  renderOffersTable();
}

function removeOffer(i) {
  if (!confirm('Delete this offer?')) return;
  state.data[state.market][state.category].splice(i, 1);
  markDirty();
  renderOffersTable();
}

function previewOffer(i) {
  const o = state.data[state.market][state.category][i];
  const param = (state.networks[o.network]?.param) || 'ref';
  const glue = (o.baseUrl || '').includes('?') ? '&' : '?';
  const url = `${o.baseUrl}${glue}${encodeURIComponent(param)}=${encodeURIComponent('admin_preview')}`;
  if (o.baseUrl) window.open(url, '_blank');
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'offers.json';
  a.click();
  URL.revokeObjectURL(a.href);
  state.dirty = false;
  updateSavePill();
  alert('Downloaded updated offers.json. Upload this to /public/offers.json in GitHub.');
}

function importJSON(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
      state.data = data;
      state.market = Object.keys(state.data)[0] || 'AU';
      state.category = Object.keys(state.data[state.market] || {})[0] || null;
      markDirty();
      renderSelectors();
      renderOffersTable();
      alert('Imported. Click “Export JSON” to download your master file, then upload to /public/offers.json.');
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function checkLogin() {
  const input = $('#pw').value.trim();
  if (input === ADMIN_PASSWORD) {
    sessionStorage.setItem('perkAdminAuth', 'granted');
    initApp();
  } else {
    alert('Incorrect password ❌');
  }
}

function logout() {
  sessionStorage.removeItem('perkAdminAuth');
  location.href = '/';
}

function markDirty() {
  state.dirty = true;
  updateSavePill();
}

function updateSavePill() {
  const pill = $('#savePill');
  if (pill) pill.textContent = state.dirty ? 'Unsaved changes' : 'All changes saved';
}

// utils
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, r => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[r]));
}
