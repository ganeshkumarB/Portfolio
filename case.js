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
})();

/* Before / after compare slider: drag the stage or move the range. Same behaviour as the one on the build notes page. */
(function () {
  "use strict";
  var figs = Array.prototype.slice.call(document.querySelectorAll("[data-compare]"));
  figs.forEach(function (fig) {
    var stage = fig.querySelector(".compare__stage"), range = fig.querySelector(".compare__range");
    if (!stage || !range) return;
    function set(v) { v = Math.max(0, Math.min(100, v)); fig.style.setProperty("--pos", v + "%"); range.value = v; }
    range.addEventListener("input", function () { set(+range.value); });
    var dragging = false;
    function fromEvent(e) { var r = stage.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    stage.addEventListener("pointerdown", function (e) { dragging = true; stage.setPointerCapture(e.pointerId); fromEvent(e); });
    stage.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    stage.addEventListener("pointerup", function () { dragging = false; });
    stage.addEventListener("pointercancel", function () { dragging = false; });
    set(+range.value || 50);
  });
})();

/* Design system case: theme and platform switches for the live demos (data-theme / data-platform on a .dsx root) */
(function () {
  "use strict";
  var segs = document.querySelectorAll(".dsy-seg[data-dsx-for]");
  Array.prototype.forEach.call(segs, function (seg) {
    var target = document.getElementById(seg.getAttribute("data-dsx-for")), kind = seg.getAttribute("data-kind");
    if (!target || !kind) return;
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-v]"); if (!b) return;
      target.setAttribute("data-" + kind, b.getAttribute("data-v"));
      Array.prototype.forEach.call(seg.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  });
})();

/* Case outline: wrap each label so the rail can reveal it, and mark the part currently in view */
(function () {
  "use strict";
  var nav = document.querySelector(".cs-formula"); if (!nav) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#part-']"));
  links.forEach(function (a) {
    var b = a.querySelector("b"); if (!b || a.querySelector("span")) return;
    var span = document.createElement("span"), node = b.nextSibling;
    while (node) { var next = node.nextSibling; span.appendChild(node); node = next; }
    a.appendChild(span);
  });
  var parts = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var ticking = false;
  function update() {
    ticking = false;
    var line = window.innerHeight * 0.4, current = -1;
    parts.forEach(function (p, i) { if (p && p.getBoundingClientRect().top <= line) current = i; });
    if (current < 0 && parts[0] && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = parts.length - 1;
    links.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
  }
  function onScroll() { if (!ticking) { ticking = true; setTimeout(update, 16); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
