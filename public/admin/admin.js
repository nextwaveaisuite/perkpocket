// Minimal admin — reads offers.json for preview only (no style collisions)
(async () => {
  try {
    const res = await fetch("../offers.json");
    if (!res.ok) throw new Error("offers.json not found");
    const offers = await res.json();
    const el = document.getElementById("adminOffers");
    el.innerHTML = offers.map(o => `
      <article class="card">
        <span class="brand-chip">${o.network}</span>
        <h4>${o.title}</h4>
        <p>${o.blurb}</p>
        <div class="meta">
          ${o.category?`<span class="pill">${o.category}</span>`:""}
          ${o.region?`<span class="pill">${o.region}</span>`:""}
        </div>
      </article>
    `).join("");
  } catch(err){
    const el = document.getElementById("adminOffers");
    el.innerHTML = `<div class="card"><h4>Admin Load Error</h4><p>${err?.message||err}</p></div>`;
  }
})();
