// ── Maintenance Mode ─────────────────────────────────────────────────────────
// Single control point for the whole site. Every page loads this as the first,
// render-blocking <script> in <head>, so it runs BEFORE any page content — or
// any of that page's other scripts — get to run.
//
// While active, it sends every page to maintenance.html. Because the redirect
// fires from <head> (before <body> is parsed), the real page's own scripts
// never execute: no content, no flash, and no third-party widgets (e.g. the
// live-chat popup) ever appear. Visitors only ever see the notice page.
//
//   Turn ON  : MAINTENANCE_ACTIVE = true
//   Turn OFF : MAINTENANCE_ACTIVE = false
//   Preview the real site while active: add ?bypass=<BYPASS_KEY> to any URL,
//   e.g. http://localhost:4000/?bypass=swiftedge2024  (remembered for the rest
//   of the browser session, so links you click afterwards bypass it too).
//
// To change the message visitors see, edit maintenance.html (not this file).

(function () {
  var MAINTENANCE_ACTIVE = true;      // ← set to false to bring the site back
  var BYPASS_KEY = 'swiftedge2024';   // ← change to something only you know
  var NOTICE_PAGE = 'maintenance.html';

  if (!MAINTENANCE_ACTIVE) return;

  // Never redirect the notice page itself (avoids a redirect loop).
  if (/\/maintenance\.html$/i.test(window.location.pathname)) return;

  // Preview the real site with ?bypass=KEY, and remember it for the rest of the
  // session so internal links you click afterwards also skip the notice.
  try {
    if (window.location.search.indexOf('bypass=' + BYPASS_KEY) !== -1) {
      sessionStorage.setItem('se_bypass', BYPASS_KEY);
      return;
    }
    if (sessionStorage.getItem('se_bypass') === BYPASS_KEY) return;
  } catch (e) {
    if (window.location.search.indexOf('bypass=' + BYPASS_KEY) !== -1) return;
  }

  // Hide anything from painting in the split second before navigation, then
  // replace this page with the notice. replace() (not href) keeps the broken
  // page out of history, so Back doesn't land on it.
  var s = document.createElement('style');
  s.textContent = 'html{background:#0b0f14 !important}body{display:none !important}';
  (document.head || document.documentElement).appendChild(s);
  window.location.replace(NOTICE_PAGE);
})();
