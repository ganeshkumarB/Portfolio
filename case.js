/* Case study pages: theme, floating nav, scroll progress, reveal. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Theme */
  var toggle = $("#themeToggle"), icon = $(".nav__theme-icon", toggle);
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) { /* ignore */ }
  function applyTheme(t) {
    var dark = t === "dark";
    if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    icon.textContent = dark ? "☾" : "☀";
    toggle.setAttribute("aria-pressed", String(dark));
  }
  if (stored === "dark") applyTheme("dark");
  toggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
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
  function onScroll() {
    var y = window.scrollY, max = root.scrollHeight - innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    var f = y > 140;
    if (f !== floating) { floating = f; nav.classList.toggle("is-floating", f); moveIndicator(active); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Reveal */
  var targets = $$(".cs-hero > *, .cs-visual, .cs-note, .cs-section, .cs-next");
  targets.forEach(function (el, i) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", (i % 4) * 60 + "ms"); });
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
