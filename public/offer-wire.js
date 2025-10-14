// offer-wire.js — non-visual enhancement for your existing buttons/links

(async function () {
  // Load networks param map
  const networks = await fetch('/networks.json', { cache: 'no-cache' })
    .then(r => r.json())
    .catch(() => ({}));

  // Stable per-user ref for attribution
  function getUserRef() {
    let id = localStorage.getItem('pp_user_ref');
    if (!id) {
      id = 'u_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('pp_user_ref', id);
    }
    return id;
  }

  function buildTrackedUrl(baseUrl, networkKey, userRef) {
    const paramName = networks[networkKey]?.param || 'ref';
    const glue = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${glue}${encodeURIComponent(paramName)}=${encodeURIComponent(userRef)}`;
  }

  // Bind to your existing offer links/buttons:
  // Example HTML you already have:
  // <a class="offer-link btn" data-baseurl="https://your-aff-link" data-network="awin">Get Offer</a>
  // or <button class="offer-link" data-baseurl="..." data-network="impact">Get Deal</button>
  //
  // No styling is changed; we just intercept clicks and open the tracked URL.
  document.querySelectorAll('.offer-link[data-baseurl]').forEach(el => {
    el.addEventListener('click', e => {
      // allow Command/Ctrl click to open in new tab naturally
      if (e.metaKey || e.ctrlKey) return;

      e.preventDefault();
      const base = el.getAttribute('data-baseurl') || el.getAttribute('href') || '';
      const net = el.getAttribute('data-network') || '';
      if (!base) return;
      const url = buildTrackedUrl(base, net, getUserRef());

      // TODO: optional analytics ping

      window.open(url, '_blank');
    }, { capture: true });
  });

  // Optional: hydrate from /offers.json if your page renders offer cards dynamically later
  // (Not needed now since we keep your page as-is.)
})();
