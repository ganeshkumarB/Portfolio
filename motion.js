/* Motion: the small script half of the site's motion system (the rest is the "Motion system" section of styles.css).
   1. Pages are fetched when you show intent (hover or touch on a link to another page of the site), so they open at once;
      the page-to-page transition itself is CSS (@view-transition).
   2. Content images fade in as they arrive instead of popping in. Nothing here runs under reduced motion except the prefetch. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement;
  var reduced = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || html.classList.contains("reduce-motion");

  /* 1. prefetch on intent: the browser's own speculation rules where it has them, a plain prefetch link otherwise */
  try {
    if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
      var s = doc.createElement("script"); s.type = "speculationrules";
      s.textContent = JSON.stringify({ prefetch: [{ where: { and: [{ href_matches: "/*" }, { not: { selector_matches: "[download], [target=_blank], [href^='mailto:']" } }] }, eagerness: "moderate" }] });
      doc.head.appendChild(s);
    } else {
      var done = {};
      var intent = function (e) {
        var a = e.target.closest && e.target.closest("a[href]"); if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
        var u; try { u = new URL(a.href, location.href); } catch (err) { return; }
        if (u.origin !== location.origin || u.pathname === location.pathname || done[u.pathname]) return;
        done[u.pathname] = 1; var l = doc.createElement("link"); l.rel = "prefetch"; l.href = u.pathname; doc.head.appendChild(l);
      };
      doc.addEventListener("pointerover", intent, { passive: true }); doc.addEventListener("touchstart", intent, { passive: true });
    }
  } catch (err) { /* nothing to speed up */ }

  /* 2. images fade in */
  if (reduced) return;
  function soft(img) {
    if (img.complete) return; /* already here (or already failed): leave it as it is */
    if (img.closest(".sunny, .puppy, .sl, [data-no-fade]")) return;
    img.classList.add("mo-wait");
    var go = function () { img.classList.remove("mo-wait"); img.classList.add("mo-in"); setTimeout(function () { img.classList.remove("mo-in"); }, 700); };
    img.addEventListener("load", go, { once: true }); img.addEventListener("error", go, { once: true });
  }
  Array.prototype.forEach.call(doc.images, soft);
  if (window.MutationObserver) new MutationObserver(function (list) {
    list.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType !== 1) return; if (n.tagName === "IMG") soft(n); else if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll("img"), soft); }); });
  }).observe(doc.documentElement, { childList: true, subtree: true });
})();
