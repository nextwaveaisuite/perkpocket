// PerkPocket public app — load, filter, sort, paginate, and show modal
(() => {
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));
  const offersEl = $("#offers");
  const searchEl = $("#search");
  const yrEl = $("#yr");
  const regionSel = $("#filterRegion");
  const catSel = $("#filterCategory");
  const sortSel = $("#sortBy");
  const clearBtn = $("#clearFilters");

  const pager = $("#pager");
  const prevBtn = $("#prevPage");
  const nextBtn = $("#nextPage");
  const pageInfo = $("#pageInfo");

  const mdl = $("#offerModal");
  const mdlClose = $("#mdlClose");
  const mdlTitle = $("#mdlTitle");
  const mdlBlurb = $("#mdlBlurb");
  const mdlMeta = $("#mdlMeta");
  const mdlPrimary = $("#mdlPrimary");
  const mdlInfo = $("#mdlInfo");

  const statTotal = $("#statTotal");
  const statAU = $("#statAU");
  const statUK = $("#statUK");

  yrEl && (yrEl.textContent = new Date().getFullYear());

  let networks = {};
  let allOffers = [];
  let viewOffers = [];
  let page = 1;
  const pageSize = 9;

  function trackUrl(offer){
    const net = networks[offer.network];
    if(!net) return offer.url;
    const url = new URL(offer.url);
    Object.entries(net.params||{}).forEach(([k,v])=>{
      if(!url.searchParams.has(k)) url.searchParams.set(k, v);
    });
    if(net.subParam){
      const subVal = offer.subId || "perkpocket";
      if(!url.searchParams.has(net.subParam)) url.searchParams.set(net.subParam, subVal);
    }
    return url.toString();
  }

  function offerCard(o){
    const tracked = trackUrl(o);
    return `
      <article class="card" data-id="${o.id}">
        <span class="brand-chip">${o.network}</span>
        <h4>${o.title}</h4>
        <p>${o.blurb}</p>
        <div class="meta">
          ${o.category?`<span class="pill">${o.category}</span>`:""}
          ${o.region?`<span class="pill">${o.region}</span>`:""}
          ${o.perk?`<span class="pill">${o.perk}</span>`:""}
          ${o.fee?`<span class="pill">Fee ${o.fee}</span>`:""}
        </div>
        <div class="actions">
          <a class="link open-modal" href="#" data-id="${o.id}">Details</a>
          <a class="link" href="${tracked}" target="_blank" rel="nofollow noopener">Get Offer</a>
          ${o.info?`<a class="link secondary" href="${o.info}" target="_blank">Info</a>`:""}
        </div>
      </article>
    `;
  }

  function setStats(list){
    statTotal && (statTotal.textContent = list.length);
    statAU && (statAU.textContent = list.filter(x=>x.region==="AU").length);
    statUK && (statUK.textContent = list.filter(x=>x.region==="UK").length);
  }

  function applyFilters(){
    const q = (searchEl?.value||"").trim().toLowerCase();
    const r = (regionSel?.value||"").trim();
    const c = (catSel?.value||"").trim();

    let list = allOffers.slice();

    if(q){
      list = list.filter(o=>[o.title,o.blurb,o.category,o.region,o.perk]
        .filter(Boolean).some(v=>v.toLowerCase().includes(q)));
    }
    if(r) list = list.filter(o=>o.region===r);
    if(c) list = list.filter(o=>(o.category||"").toLowerCase()===c.toLowerCase());

    switch((sortSel?.value)||"featured"){
      case "alpha": list.sort((a,b)=>a.title.localeCompare(b.title)); break;
      case "category": list.sort((a,b)=>String(a.category).localeCompare(String(b.category))); break;
      case "region": list.sort((a,b)=>String(a.region).localeCompare(String(b.region))); break;
      default: /* featured – leave original order */ break;
    }

    viewOffers = list;
    setStats(list);
    page = 1;
    renderPage();
  }

  function renderPage(){
    const total = viewOffers.length;
    const pages = Math.max(1, Math.ceil(total/pageSize));
    page = Math.max(1, Math.min(page, pages));
    const start = (page-1)*pageSize;
    const slice = viewOffers.slice(start, start+pageSize);
    offersEl.innerHTML = slice.length
      ? slice.map(offerCard).join("")
      : `<div class="card"><h4>No offers found</h4><p>Try another keyword or category.</p></div>`;

    // pager
    if (total > pageSize){
      pager.classList.remove("hide");
      pageInfo.textContent = `Page ${page} of ${pages}`;
      prevBtn.disabled = page<=1;
      nextBtn.disabled = page>=pages;
    } else {
      pager.classList.add("hide");
    }

    // wire "Details" clicks
    $$(".open-modal", offersEl).forEach(a=>{
      a.addEventListener("click",(e)=>{
        e.preventDefault();
        const id = a.dataset.id;
        const o = allOffers.find(x=>x.id===id);
        if(o) openModal(o);
      });
    });
  }

  function openModal(o){
    mdlTitle.textContent = o.title;
    mdlBlurb.textContent = o.blurb || "";
    mdlMeta.innerHTML = `
      ${o.category?`<span class="pill">${o.category}</span>`:""}
      ${o.region?`<span class="pill">${o.region}</span>`:""}
      ${o.perk?`<span class="pill">${o.perk}</span>`:""}
      ${o.fee?`<span class="pill">Fee ${o.fee}</span>`:""}
      <span class="pill">Network: ${o.network}</span>
    `;
    mdlPrimary.href = trackUrl(o);
    if(o.info){ mdlInfo.href = o.info; mdlInfo.classList.remove("hide"); }
    else { mdlInfo.classList.add("hide"); }
    mdl.classList.remove("hide");
  }

  function closeModal(){
    mdl.classList.add("hide");
  }

  // events
  $("#searchBtn")?.addEventListener("click", applyFilters);
  searchEl?.addEventListener("keydown", e=>{ if(e.key==="Enter") applyFilters(); });
  regionSel?.addEventListener("change", applyFilters);
  catSel?.addEventListener("change", applyFilters);
  sortSel?.addEventListener("change", applyFilters);
  clearBtn?.addEventListener("click", ()=>{
    if(searchEl) searchEl.value="";
    if(regionSel) regionSel.value="";
    if(catSel) catSel.value="";
    if(sortSel) sortSel.value="featured";
    applyFilters();
  });

  prevBtn?.addEventListener("click", ()=>{ page--; renderPage(); window.scrollTo({top:0, behavior:"smooth"}); });
  nextBtn?.addEventListener("click", ()=>{ page++; renderPage(); window.scrollTo({top:0, behavior:"smooth"}); });
  $("#mdlClose")?.addEventListener("click", closeModal);
  mdl?.addEventListener("click", (e)=>{ if(e.target===mdl) closeModal(); });

  // categories click
  $$(".cat-card").forEach(el=>{
    el.addEventListener("click", ()=>{
      if(catSel) catSel.value = el.dataset.cat || "";
      applyFilters();
      window.scrollTo({top: offersEl.offsetTop-20, behavior:"smooth"});
    });
  });

  async function boot(){
    try{
      const [nRes, oRes] = await Promise.all([fetch("networks.json"), fetch("offers.json")]);
      networks = await nRes.json();
      allOffers = await oRes.json();
      setStats(allOffers);
      viewOffers = allOffers.slice();
      renderPage();
    }catch(err){
      offersEl.innerHTML = `<div class="card"><h4>Load error</h4><p>${err?.message||err}</p></div>`;
    }
  }

  boot();
})();
