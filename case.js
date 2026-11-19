/* Case study pages: theme, floating nav, scroll progress, reveal. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Theme */
  var toggle = $("#themeToggle"), icon = $(".nav__theme-icon", toggle);
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) { /* ignore */ }
  function applyTheme(t) {
    var dark = t === "dark";
    if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    if (icon) icon.textContent = dark ? "☾" : "☀";
    toggle.setAttribute("aria-pressed", String(dark));
  }
  if (stored === "dark") applyTheme("dark");
  toggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
    toggle.classList.add("is-spinning");
    setTimeout(function () { toggle.classList.remove("is-spinning"); }, 450);
    applyTheme(next);
  });

  /* Nav indicator + floating + progress */
  var nav = $(".nav"), indicator = $(".nav__indicator"), active = $(".nav__link.is-active");
  function moveIndicator(el) { indicator.style.left = el.offsetLeft + "px"; indicator.style.top = el.offsetTop + "px"; indicator.style.width = el.offsetWidth + "px"; }
  moveIndicator(active);
  requestAnimationFrame(function () { nav.classList.add("is-ready"); });
  $$(".nav__link").forEach(function (a) { a.addEventListener("mouseenter", function () { moveIndicator(a); }); });
  $(".nav__pill").addEventListener("mouseleave", function () { moveIndicator(active); });
  window.addEventListener("resize", function () { moveIndicator(active); });
  var progress = $(".progress"), floating = false;
  var resumePct = $("#navResumePct"), resumeFill = $("#navResumeFill");
  function onScroll() {
    var y = window.scrollY, max = root.scrollHeight - innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (resumeFill) { var pct = max > 0 ? Math.round(Math.min(1, y / max) * 100) : 0; if (resumePct) resumePct.textContent = pct + "%"; resumeFill.style.width = pct + "%"; }
    var f = y > 140;
    if (f !== floating) { floating = f; nav.classList.toggle("is-floating", f); moveIndicator(active); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Reveal */
  var targets = $$(".cs-hero > *, .cs-cover, .cs-visual, .cs-note, .cs-public, .cs-section, .cs-next");
  targets.forEach(function (el, i) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", (i % 4) * 60 + "ms"); });
  /* Steps, tiles, cards and decision rows come in one by one, staggered by their position in the row */
  var steps = $$(".cs-steps > *, .row--arrows > *, .nrows > .nrow, .g > .tile, .g > .card, .branches-v > .branch");
  steps.forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.setAttribute("data-reveal", "step");
    el.style.setProperty("--d", Math.min(i, 9) * 110 + "ms");
  });
  targets = targets.concat(steps);
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ============================================================
     Quick read / Full story: a 60-second version of the case study,
     assembled from the page itself so it never drifts from the content
     ============================================================ */
  (function () {
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var hero = $(".cs-hero"), content = $(".cs-content");
    if (!hero || !content || !/^case-/.test(location.pathname.split("/").pop())) return; /* case studies only */
    var lede = $(".cs-lede", hero);
    var role = null; $$(".cs-meta dl div", hero).forEach(function (d) { var dt = $("dt", d); if (dt && /role/i.test(dt.textContent)) role = $("dd", d).textContent.trim(); });
    var sections = $$(".cs-section", content).map(function (sec) {
      return { el: sec, title: ($(".cs-h2", sec) || {}).textContent || "", sub: ($(".cs-sub", sec) || {}).textContent || "" };
    });
    function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
    /* two decisions: the "decisions" section if there is one, otherwise the first two sections after the opener */
    var decisions = [];
    var decSec = sections.filter(function (s) { return /decision/i.test(s.title); })[0];
    if (decSec) {
      $$(".nrow, .tile, .card", decSec.el).slice(0, 2).forEach(function (row) {
        var h = $("h3, .t-h", row), p = $("p:not(.t-h)", row);
        if (h) decisions.push({ h: clean(h.textContent), p: clean(p ? p.textContent : "") });
      });
    }
    if (decisions.length < 2) {
      sections.slice(1, 3).forEach(function (s) { if (decisions.length < 2) decisions.push({ h: clean(s.title), p: clean(s.sub) }); });
    }
    /* outcome: the "shipped" section, else the last section that is not "what I learned" */
    var outSec = sections.filter(function (s) { return /^shipped/i.test(s.title); })[0] ||
      sections.filter(function (s) { return !/learned/i.test(s.title); }).slice(-1)[0];
    var outcome = "";
    if (outSec) {
      var today = $(".tile--ink .t-serif, .card--ink .t-h, .tile--ink .t-h", outSec.el);
      var todayP = today && $(".t-p", today.parentElement);
      outcome = clean(today ? today.textContent + (todayP ? ". " + todayP.textContent : "") : (outSec.sub || outSec.title));
    }
    var learned = sections.filter(function (s) { return /learned/i.test(s.title); })[0];
    var lesson = learned ? clean(($(".t-h, h3, .t-serif, p", learned.el) || {}).textContent) : "";

    var toggle = document.createElement("div");
    toggle.className = "readmode";
    toggle.setAttribute("role", "group"); toggle.setAttribute("aria-label", "How much to read");
    toggle.innerHTML = '<button type="button" class="readmode__btn" data-mode="quick">Quick read <span class="mono">60 s</span></button><button type="button" class="readmode__btn is-on" data-mode="full">Full story</button>';
    var tags = $(".cs-tags", hero);
    (tags || hero).insertAdjacentElement(tags ? "afterend" : "afterbegin", toggle);

    var quick = document.createElement("section");
    quick.className = "quick"; quick.id = "quick"; quick.hidden = true;
    quick.setAttribute("aria-label", "Quick read");
    quick.innerHTML =
      '<div class="quick__grid">' +
        '<div class="quick__cell quick__cell--wide"><span class="lbl lbl--12 lbl--blue">The problem</span><p>' + esc(clean(lede ? lede.textContent : "")) + "</p></div>" +
        (role ? '<div class="quick__cell"><span class="lbl lbl--12 lbl--blue">My role</span><p>' + esc(role) + "</p></div>" : "") +
        decisions.map(function (d, i) { return '<div class="quick__cell"><span class="lbl lbl--12 lbl--blue">Decision 0' + (i + 1) + '</span><p><b>' + esc(d.h) + "</b>" + (d.p ? " " + esc(d.p) : "") + "</p></div>"; }).join("") +
        (outcome ? '<div class="quick__cell quick__cell--ink"><span class="lbl lbl--12 lbl--sun">Outcome</span><p>' + esc(outcome) + "</p></div>" : "") +
        (lesson ? '<div class="quick__cell"><span class="lbl lbl--12 lbl--blue">What I learned</span><p>' + esc(lesson) + "</p></div>" : "") +
      "</div>" +
      '<p class="quick__foot mono">Pulled from this page. <button type="button" class="quick__more" data-mode="full">Read the full story →</button></p>';
    content.insertAdjacentElement("beforebegin", quick);

    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function setMode(mode, quiet) {
      var isQuick = mode === "quick";
      document.body.classList.toggle("is-quick", isQuick);
      quick.hidden = !isQuick;
      $$(".readmode__btn", toggle).forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-mode") === mode); b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === mode)); });
      try { localStorage.setItem("case:view", mode); } catch (e) { /* ignore */ }
      if (!quiet && isQuick) quick.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    document.addEventListener("click", function (e) { var b = e.target.closest("[data-mode]"); if (b) setMode(b.getAttribute("data-mode")); });
    var saved = null; try { saved = localStorage.getItem("case:view"); } catch (e) { /* ignore */ }
    if (new URL(location.href).searchParams.get("read") === "quick" || saved === "quick") setMode("quick", true);
  })();
})();
