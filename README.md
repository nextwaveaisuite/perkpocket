# PerkPocket — Flat Root + Isolated /admin

**Public site files at the repo root** (index.html + style.css + JS + JSON).
**Admin console lives only in `/admin`** and uses the public theme without global resets.

### Paths
- `/` → `index.html` with `style.css` beside it (prevents “plain” look).
- `/admin` → rewrites to `/admin/admin.html` (vercel.json).
- Admin references `../style.css` and `../app.js` (assets stay at root).

### Deploy
- Push to GitHub; Vercel will serve statics from root automatically.
- If you see unstyled UI, confirm `index.html` finds `style.css` at the same level.
