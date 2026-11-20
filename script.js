(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ============================================================
     Theme toggle with circular wipe
     ============================================================ */
  var toggle = $("#themeToggle");
  var toggleIcon = $(".nav__theme-icon", toggle);
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) { /* storage unavailable */ }

  function applyTheme(theme) {
    var dark = theme === "dark";
    if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    if (toggleIcon) toggleIcon.textContent = dark ? "☾" : "☀";
    toggle.setAttribute("aria-pressed", String(dark));
  }
  if (stored === "dark") applyTheme("dark");

  toggle.addEventListener("click", function (e) {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", next); } catch (err) { /* ignore */ }

    toggle.classList.add("is-spinning");
    setTimeout(function () { toggle.classList.remove("is-spinning"); }, 450);

    if (!reduced && document.startViewTransition && !toggle.vtBusy) {
      var x = e.clientX || toggle.getBoundingClientRect().left + 19;
      var y = e.clientY || toggle.getBoundingClientRect().top + 19;
      var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      toggle.vtBusy = true;
      var vt = document.startViewTransition(function () { applyTheme(next); });
      vt.ready.then(function () {
        root.animate(
          { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
          { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      }).catch(function () { /* transition skipped */ });
      vt.finished.catch(function () { /* ignore */ }).then(function () { toggle.vtBusy = false; });
    } else {
      applyTheme(next);
    }
  });

  /* ============================================================
     Nav: sliding indicator, floating pill, scroll progress
     ============================================================ */
  var nav = $(".nav");
  var pill = $(".nav__pill");
  var indicator = $(".nav__indicator");
  var links = $$(".nav__link");
  var activeLink = $(".nav__link.is-active") || links[0];
  var progress = $(".progress");
  var resumePct = $("#navResumePct"), resumeFill = $("#navResumeFill");

  function moveIndicator(el) {
    indicator.style.left = el.offsetLeft + "px";
    indicator.style.top = el.offsetTop + "px";
    indicator.style.width = el.offsetWidth + "px";
  }
  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) activeLink = a;
    });
    moveIndicator(activeLink);
  }
  requestAnimationFrame(function () { moveIndicator(activeLink); nav.classList.add("is-ready"); });
  window.addEventListener("resize", function () { moveIndicator(activeLink); });

  links.forEach(function (a) {
    a.addEventListener("mouseenter", function () { moveIndicator(a); });
    a.addEventListener("focus", function () { moveIndicator(a); });
  });
  pill.addEventListener("mouseleave", function () { moveIndicator(activeLink); });

  var sections = links.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window) {
    var visible = {};
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var best = null;
      sections.forEach(function (s) { if (visible[s.id] && (!best || visible[s.id] > visible[best])) best = s.id; });
      if (best) setActive(best);
    }, { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  var floating = false;
  function onScroll() {
    var y = window.scrollY;
    var max = root.scrollHeight - innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (resumeFill) { var pct = max > 0 ? Math.round(Math.min(1, y / max) * 100) : 0; if (resumePct) resumePct.textContent = pct + "%"; resumeFill.style.width = pct + "%"; }
    var shouldFloat = y > 140;
    if (shouldFloat !== floating) {
      floating = shouldFloat;
      nav.classList.toggle("is-floating", floating);
      moveIndicator(activeLink);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     Hero intro: headline words, sync sequence, status
     ============================================================ */
  var title = $("#heroTitle");
  var accentWords = ["code"];
  (function splitTitle() {
    var words = title.textContent.trim().split(/\s+/);
    title.textContent = "";
    words.forEach(function (w, i) {
      var span = document.createElement("span");
      span.className = "w" + (accentWords.indexOf(w.replace(/[^\w]/g, "")) > -1 ? " w--accent" : "");
      span.style.setProperty("--w", i);
      span.textContent = w;
      title.appendChild(span);
      if (i < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
  })();

  var navStatus = $("#navStatus");
  var bridgeStatus = $("#bridgeStatus");
  var bridge = $("#bridge");
  var codeLines = $$("#bridgeCode .ln");

  function setStatus(text, syncing) {
    [navStatus, bridgeStatus].filter(Boolean).forEach(function (el) {
      el.textContent = text;
      el.classList.toggle("is-syncing", syncing);
      if (!syncing) { el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse"); }
    });
  }

  function typeLine(el, text, speed) {
    return new Promise(function (resolve) {
      var i = 0;
      el.textContent = "";
      el.classList.add("is-typing");
      (function tick() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(tick, speed + Math.random() * 14);
        } else {
          el.classList.remove("is-typing");
          resolve();
        }
      })();
    });
  }

  async function runSync(first) {
    var texts = codeLines.map(function (l) { return l.textContent; });
    setStatus("○ syncing · 3 drift", true);
    bridge.classList.add("is-selecting");
    codeLines.forEach(function (l) { l.textContent = ""; });
    await wait(first ? 650 : 100);
    for (var i = 0; i < codeLines.length; i++) {
      await typeLine(codeLines[i], texts[i], texts[i] ? 16 : 0);
      if (i === 3) setStatus("○ syncing · 2 drift", true);
      if (i === 5) setStatus("○ syncing · 1 drift", true);
    }
    await wait(200);
    setStatus("● synced · 0 drift", false);
    await wait(900);
    bridge.classList.remove("is-selecting");
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("is-ready");
      if (!reduced) runSync(true);
    });
  });
  $(".bridge__header").addEventListener("click", function () { if (!reduced) runSync(false); });

  /* Token <-> code linking */
  var tokenMap = { "color/ink": "is-hot-ink", "radius/md": "is-hot-radius", "space/3": "is-hot-space" };
  function hot(name, on) {
    $$('[data-token="' + name + '"]').forEach(function (el) { el.classList.toggle("is-hot", on); });
    bridge.classList.toggle(tokenMap[name], on);
  }
  $$("[data-token]").forEach(function (el) {
    var name = el.getAttribute("data-token");
    el.addEventListener("mouseenter", function () { hot(name, true); });
    el.addEventListener("mouseleave", function () { hot(name, false); });
    el.addEventListener("focus", function () { hot(name, true); });
    el.addEventListener("blur", function () { hot(name, false); });
  });

  /* Magnetic buttons */
  if (finePointer && !reduced) {
    $$(".btn").forEach(function (b) {
      b.classList.add("is-magnetic");
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = "translate(" + dx * 6 + "px," + dy * 6 + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* ============================================================
     Scroll reveal + counters
     ============================================================ */
  var revealTargets = [
    [".section__head", 0],
    [".fact", 80],
    [".work__list", 0],
    [".how__card", 90],
    [".how__tile", 90],
    [".story__portrait", 0],
    [".story__copy > *", 90],
    [".piece", 60],
    [".gallery__more", 0],
    [".featured", 0],
    [".post", 70],
    [".posts__more", 0],
    [".group", 90],
    [".contact__title", 0],
    [".contact__mail", 120],
    [".contact__links", 200],
    [".contact__footer", 300]
  ];
  revealTargets.forEach(function (t) {
    $$(t[0]).forEach(function (el, i) {
      el.setAttribute("data-reveal", el.classList.contains("piece") ? "scale" : "");
      el.style.setProperty("--d", (i % 8) * t[1] + "ms");
    });
  });
  $$(".pipeline__arrow").forEach(function (el, i) {
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--d", (i * 120 + 70) + "ms");
  });

  function countUp(el) {
    var raw = el.getAttribute("data-count");
    var num = parseInt(raw, 10);
    var suffix = raw.replace(/[\d]/g, "");
    var start = null, dur = 1400;
    function frame(ts) {
      if (!start) start = ts;
      var p = clamp((ts - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(num * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        $$("[data-count]", en.target).forEach(countUp);
        if (en.target.hasAttribute("data-count")) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$("[data-reveal]").forEach(function (el) { io.observe(el); });
  } else {
    $$("[data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ============================================================
     Work accordion: animated height, one open at a time
     ============================================================ */
  var cases = $$(".case");
  var animating = false;

  function animateCase(d, open) {
    var summary = $("summary", d);
    var body = $(".case__body", d);
    d.classList.add("is-animating");
    var startH = d.offsetHeight;
    if (open) d.open = true;
    var endH = open ? summary.offsetHeight + body.offsetHeight : summary.offsetHeight;
    if (open) d.classList.add("is-opening");
    var anim = d.animate(
      { height: [startH + "px", endH + "px"] },
      { duration: reduced ? 0 : 420, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    );
    return anim.finished.then(function () {
      if (!open) d.open = false;
      d.classList.remove("is-animating", "is-opening");
      d.style.height = "";
    });
  }

  cases.forEach(function (d) {
    $("summary", d).addEventListener("click", function (e) {
      e.preventDefault();
      if (animating) return;
      animating = true;
      var tasks = [];
      if (d.open) {
        tasks.push(animateCase(d, false));
      } else {
        cases.forEach(function (o) { if (o !== d && o.open) tasks.push(animateCase(o, false)); });
        tasks.push(animateCase(d, true));
      }
      Promise.all(tasks).then(function () { animating = false; });
    });
  });

  /* ============================================================
     Process pipeline: a token travels from Tokens to Ship
     ============================================================ */
  var pipeline = $("#pipeline") || document.createElement("ol"); /* the pipeline left with the How I work redesign; kept inert for older pages */
  var dot = $(".pipeline__dot", pipeline);
  var steps = $$(".step", pipeline);
  var arrows = $$(".pipeline__arrow", pipeline);
  var pipelineRunning = false;

  async function runPipeline() {
    if (pipelineRunning || reduced) return;
    pipelineRunning = true;
    steps.forEach(function (s) { s.classList.remove("is-lit"); });
    arrows.forEach(function (a) { a.classList.remove("is-lit"); });
    var horizontal = getComputedStyle(arrows[0]).display !== "none";
    var pr = pipeline.getBoundingClientRect();

    if (horizontal) {
      dot.style.opacity = "1";
      for (var i = 0; i < steps.length; i++) {
        var r = steps[i].getBoundingClientRect();
        var x = r.left - pr.left + 20;
        var y = r.top - pr.top + 32;
        await dot.animate(
          { left: [dot.style.left || x + "px", x + "px"], top: [dot.style.top || y + "px", y + "px"] },
          { duration: i === 0 ? 300 : 520, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
        ).finished;
        dot.style.left = x + "px"; dot.style.top = y + "px";
        steps[i].classList.add("is-lit");
        if (arrows[i]) arrows[i].classList.add("is-lit");
        await wait(260);
      }
      dot.animate({ transform: ["translate(-50%,-50%) scale(1)", "translate(-50%,-50%) scale(2.4)"], opacity: [1, 0] },
        { duration: 500, easing: "ease-out", fill: "forwards" });
      await wait(500);
      dot.getAnimations().forEach(function (a) { a.cancel(); });
      dot.style.cssText = "";
    } else {
      for (var j = 0; j < steps.length; j++) { steps[j].classList.add("is-lit"); await wait(200); }
    }
    await wait(1200);
    steps.forEach(function (s, k) { if (k < steps.length - 1) s.classList.remove("is-lit"); });
    arrows.forEach(function (a) { a.classList.remove("is-lit"); });
    pipelineRunning = false;
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setTimeout(runPipeline, 500); });
    }, { threshold: 0.6 }).observe(pipeline);
  }
  pipeline.addEventListener("click", function () { runPipeline(); });

  /* ============================================================
     Tilt: portrait and gallery tiles
     ============================================================ */
  function tilt(el, maxDeg, scale) {
    if (!finePointer || reduced) return;
    var glare = $(".glare", el);
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      el.classList.add("is-tilting");
      el.style.transform = "perspective(900px) rotateX(" + ((0.5 - py) * maxDeg) + "deg) rotateY(" + ((px - 0.5) * maxDeg) + "deg) scale(" + scale + ")";
      if (glare) { glare.style.setProperty("--gx", px * 100 + "%"); glare.style.setProperty("--gy", py * 100 + "%"); }
    });
    el.addEventListener("mouseleave", function () {
      el.classList.remove("is-tilting");
      el.style.transform = "";
    });
  }
  $$("[data-tilt]").forEach(function (el) { tilt(el, 10, 1.02); });
  $$(".piece__image").forEach(function (el) { tilt(el, 7, 1.015); });

  /* ============================================================
     Gallery lightbox
     ============================================================ */
  var pieces = $$(".piece");
  var lb = $("#lightbox");
  var lbImg = $("#lightboxImg");
  var lbTitle = $("#lightboxTitle");
  var lbMeta = $("#lightboxMeta");
  var lbIndex = 0;
  var lastFocus = null;

  function pieceData(p) {
    var img = $("img", p);
    var tile = $(".piece__image", p);
    return {
      src: p.getAttribute("href"),
      alt: img.getAttribute("alt"),
      title: $(".piece__caption span", p).textContent,
      tag: $(".piece__tag", p).textContent,
      bg: tile.style.getPropertyValue("--piece-bg") || "",
      img: img
    };
  }

  function showPiece(i, animateFrom) {
    lbIndex = (i + pieces.length) % pieces.length;
    var d = pieceData(pieces[lbIndex]);
    lbImg.style.setProperty("--lb-bg", d.bg || "transparent");
    lbImg.src = d.src;
    lbImg.alt = d.alt;
    lbTitle.textContent = d.title;
    lbMeta.textContent = d.tag + "  ·  " + (lbIndex + 1) + " / " + pieces.length;

    var go = function () {
      if (reduced) return;
      if (animateFrom) {
        var from = animateFrom.getBoundingClientRect();
        var to = lbImg.getBoundingClientRect();
        var sx = from.width / to.width, sy = from.height / to.height;
        lbImg.animate(
          [{ transform: "translate(" + (from.left - to.left) + "px," + (from.top - to.top) + "px) scale(" + sx + "," + sy + ")", borderRadius: "14px" },
           { transform: "none", borderRadius: "14px" }],
          { duration: 520, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
        );
      } else {
        lbImg.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
      }
    };
    if (lbImg.complete && lbImg.naturalWidth) go(); else lbImg.onload = go;
  }

  function openLightbox(i, fromEl) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("lb-open");
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    showPiece(i, fromEl);
    $(".lightbox__close", lb).focus();
  }
  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.classList.remove("lb-open");
    setTimeout(function () { lb.hidden = true; lbImg.removeAttribute("src"); }, 300);
    if (lastFocus) lastFocus.focus();
  }

  pieces.forEach(function (p, i) {
    p.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      openLightbox(i, $("img", p));
    });
  });
  lb.addEventListener("click", function (e) {
    var act = e.target.getAttribute("data-lb");
    if (act === "close" || e.target === lb) closeLightbox();
    else if (act === "prev") showPiece(lbIndex - 1);
    else if (act === "next") showPiece(lbIndex + 1);
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showPiece(lbIndex - 1);
    else if (e.key === "ArrowRight") showPiece(lbIndex + 1);
  });

  /* ============================================================
     Contact: typed email, copy to clipboard, toast
     ============================================================ */
  var emailLink = $("#emailLink");
  var emailText = emailLink.textContent;
  var toast = $("#toast");
  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-show"); }, 1800);
  }

  if ("IntersectionObserver" in window && !reduced) {
    var typed = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || typed) return;
        typed = true;
        typeLine(emailLink, emailText, 38).then(function () {
          emailLink.classList.add("is-typing");
          setTimeout(function () { emailLink.classList.remove("is-typing"); }, 2600);
        });
      });
    }, { threshold: 0.6 }).observe(emailLink);
  }

  $("#copyEmail").addEventListener("click", function () {
    var done = function () { showToast("✓ " + emailText + " copied"); };
    if (navigator.clipboard) navigator.clipboard.writeText(emailText).then(done, done);
    else done();
  });

  /* ============================================================
     Career map: click a year, see what shipped
     ============================================================ */
  var SENIOR = "Senior Product Designer (Visual & Systems), Zoho SalesIQ";
  var VISUAL = "Visual Designer, Zoho SalesIQ";
  var CAREER = {
    "2017": { chip: "education", role: "BCA, Computer Applications", items: [
      { t: "Kongu Arts and Science College, Bharathiar University", d: "Three years of computer applications. The design habit started on the side." }
    ] },
    "2018": { chip: "joined zoho", role: "Visual Designer intern → Visual Designer, Zoho SalesIQ", items: [
      { t: "Joined Zoho as a design intern", d: "Moved onto SalesIQ the same year and have designed it ever since." },
      { t: "Zobot, the no-code chatbot builder", d: "Sole designer from the first canvas sketches. Website at launch, seven channels today.", href: "case-zobot.html" }
    ] },
    "2019": { chip: "visual designer", role: VISUAL, items: [
      { t: "Zobot ships in SalesIQ 2.0", d: "The drag-and-drop builder goes live for every SalesIQ customer.", href: "case-zobot.html" }
    ] },
    "2020": { chip: "visual designer", role: VISUAL, items: [
      { t: "Reports and analytics revamp", d: "One place to read engagement, support, bots, outbound and live activity. Shipped as Reports 2.0.", href: "case-reports.html" }
    ] },
    "2021": { chip: "visual designer", role: VISUAL, items: [
      { t: "Brand configuration, rebuilt as self-service", d: "Shared settings set once, every channel on its own card.", href: "case-brand-configuration.html" },
      { t: "Proactive Chat across channels", d: "Triggers and messages that reach visitors before they ask." }
    ] },
    "2022": { chip: "visual designer", role: VISUAL, items: [
      { t: "Outbound broadcast and push campaigns", d: "Write once, choose who gets it, schedule it, see how it went. WhatsApp, web and mobile.", href: "case-outbound.html" }
    ] },
    "2023": { chip: "visual designer", role: VISUAL, items: [
      { t: "Survey, Rating and Feedback", d: "Faces, stars or yes/no at the end of a chat, with a different reply for every rating.", href: "case-feedback.html" },
      { t: "User-education videos", d: "SalesIQ videos shown at Zoholics, partner events and meetups." }
    ] },
    "2024": { chip: "promoted", role: SENIOR, items: [
      { t: "Senior Product Designer", d: "Visual and systems: owning how SalesIQ looks and how it gets built." },
      { t: "SalesIQ design system", d: "48+ components on one set of tokens, with light and dark modes.", href: "case-design-system.html" },
      { t: "Operator Console redesign", d: "Queue, conversation and visitor details in one calm view.", href: "case-operator-console.html" }
    ] },
    "2025": { chip: "design systems", role: SENIOR, items: [
      { t: "Code Connect for every component", d: "Each Figma component mapped to its real code, so Dev Mode shows the truth.", href: "case-design-system.html" },
      { t: "Figma MCP + Claude workflow", d: "Agents read the mappings and generate production components. The system ships twice: Figma library and code.", href: "case-design-system.html" }
    ] },
    "2026": { chip: "now", role: SENIOR, items: [
      { t: "Portfolio v2 and the pendant mark", d: "This site: designed by me, built with Claude in HTML, CSS and a little JavaScript." },
      { t: "Writing on LinkedIn", d: "Carousels on UI fundamentals, UX and design systems. One screen, one idea.", href: "#writing" },
      { t: "Open to lead product design roles", d: "Design systems, design tooling and where AI fits in a designer's workflow.", href: "#contact" }
    ] }
  };
  var careerEl = $("#career");
  if (careerEl) {
    var yearBtns = $$(".career__year", careerEl);
    var careerTrack = $(".career__track", careerEl), careerLine = $(".career__line", careerEl), careerFill = $("#careerFill");
    var cYear = $("#careerYear"), cRole = $("#careerRole"), cChip = $("#careerChip"), cItems = $("#careerItems");
    var careerLabels = { "2017": "’14–17" };
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function selectedIndex() {
      for (var i = 0; i < yearBtns.length; i++) if (yearBtns[i].getAttribute("aria-selected") === "true") return i;
      return yearBtns.length - 1;
    }
    function placeFill() {
      var i = selectedIndex();
      var dot = $(".career__dot", yearBtns[i]).getBoundingClientRect();
      var line = careerLine.getBoundingClientRect();
      careerFill.style.width = Math.max(0, dot.left + dot.width / 2 - line.left) + "px";
    }
    function selectYear(year, focus) {
      var data = CAREER[year];
      if (!data) return;
      var idx = 0;
      yearBtns.forEach(function (b, i) {
        var on = b.getAttribute("data-year") === String(year);
        b.setAttribute("aria-selected", String(on));
        b.setAttribute("tabindex", on ? "0" : "-1");
        if (on) idx = i;
      });
      yearBtns.forEach(function (b, i) { b.classList.toggle("is-past", i < idx); });
      placeFill();
      cYear.textContent = careerLabels[year] || year;
      cRole.textContent = data.role;
      cChip.textContent = data.chip;
      cItems.innerHTML = data.items.map(function (it, i) {
        var link = it.href ? '<a href="' + it.href + '">' + (it.href.charAt(0) === "#" ? "Jump to section" : "Read the case study") + " →</a>" : "";
        return '<li class="career__item" style="--i:' + i + '"><b>' + esc(it.t) + "</b><span>" + esc(it.d) + "</span>" + link + "</li>";
      }).join("");
      if (focus) yearBtns[idx].focus();
    }
    yearBtns.forEach(function (b) {
      b.addEventListener("click", function () { selectYear(b.getAttribute("data-year"), false); });
    });
    careerTrack.addEventListener("keydown", function (e) {
      var cur = selectedIndex(), next = null;
      if (e.key === "ArrowRight") next = Math.min(yearBtns.length - 1, cur + 1);
      else if (e.key === "ArrowLeft") next = Math.max(0, cur - 1);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = yearBtns.length - 1;
      if (next === null) return;
      e.preventDefault();
      selectYear(yearBtns[next].getAttribute("data-year"), true);
    });
    window.addEventListener("resize", placeFill);
    selectYear("2026", false);
  }
})();
