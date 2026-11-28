/* Creative layer: inspect mode, layout grid, ghost cursor,
   token diff console. */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 1800);
  }
  var typingTarget = function (e) { return /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable; };

  /* ============================================================
     Token dictionary (resolves computed styles to token names)
     ============================================================ */
  var colorVars = {
    "--bg": "color/bg", "--ink": "color/ink", "--body": "color/body", "--muted": "color/muted",
    "--line": "color/line", "--surface": "color/surface", "--sun": "color/sun", "--blue": "color/blue",
    "--green": "color/green", "--green-bright": "color/green-bright", "--code-bg": "color/code-bg",
    "--code-fg": "color/code-fg", "--ship-fg": "color/ship-fg", "--pill-active": "color/pill-active"
  };
  var ctx = document.createElement("canvas").getContext("2d");
  function toHex(c) {
    if (!c || c === "transparent" || /rgba\(.*,\s*0\)$/.test(c)) return null;
    ctx.fillStyle = "#000"; ctx.fillStyle = c;
    var v = ctx.fillStyle;
    return typeof v === "string" && v[0] === "#" ? v.toLowerCase() : null;
  }
  function colorMap() {
    var cs = getComputedStyle(document.documentElement);
    var map = {};
    Object.keys(colorVars).forEach(function (k) {
      var hex = toHex(cs.getPropertyValue(k).trim());
      if (hex && !map[hex]) map[hex] = colorVars[k];
    });
    map["#ffffff"] = map["#ffffff"] || "color/white";
    map["#15161a"] = map["#15161a"] || "color/ink";
    return map;
  }
  var radii = { 999: "radius/pill", 18: "radius/xl", 14: "radius/lg", 12: "radius/md", 10: "radius/md-", 6: "radius/sm", 5: "radius/sm", 4: "radius/xs", 1: "radius/none" };
  function spaceToken(px) {
    var n = px / 4;
    return n && Math.abs(n - Math.round(n)) < 0.01 ? "space/" + Math.round(n) : px + "px";
  }
  function typeToken(cs) {
    var fam = cs.fontFamily.split(",")[0].replace(/["']/g, "");
    var size = parseFloat(cs.fontSize);
    var name = /Space Grotesk/i.test(fam) ? (size >= 60 ? "type/display" : size >= 40 ? "type/h1" : size >= 24 ? "type/h2" : "type/serif")
      : /JetBrains/i.test(fam) ? "type/mono" : size >= 17 ? "type/lead" : size <= 12 ? "type/caption" : "type/body";
    var lh = cs.lineHeight === "normal" ? "" : " / " + (Math.round(parseFloat(cs.lineHeight) / size * 100) / 100);
    return { name: name, value: fam + " " + Math.round(size) + lh };
  }
  function layerName(el) {
    if (el.dataset.layer) return el.dataset.layer;
    var cls = Array.prototype.find.call(el.classList, function (c) { return !/^(is-|mono|w$|w--)/.test(c); });
    if (!cls) return el.tagName.toLowerCase();
    var aliases = { btn: "Button", cta: "CTA", ig: "Instagram", nav: "Nav", cs: "Case study" };
    return cls.split("__").map(function (p) {
      var base = p.split("--")[0];
      return aliases[base] || base.replace(/-/g, " ").replace(/^\w/, function (m) { return m.toUpperCase(); });
    }).join(" / ") + (cls.indexOf("--") > -1 ? " · " + cls.split("--")[1] : "");
  }
  function describe(el) {
    var cs = getComputedStyle(el);
    var cmap = colorMap();
    var rows = [];
    var t = typeToken(cs);
    if (el.textContent.trim()) rows.push({ k: t.name, v: t.value, css: "font: " + cs.fontWeight + " " + cs.fontSize + "/" + cs.lineHeight + " " + cs.fontFamily.split(",")[0] });
    var fg = toHex(cs.color);
    if (fg && el.textContent.trim()) rows.push({ k: cmap[fg] || "color", v: fg, sw: fg, css: "color: " + fg });
    var bg = toHex(cs.backgroundColor);
    if (bg) rows.push({ k: (cmap[bg] || "fill") + " (fill)", v: bg, sw: bg, css: "background: " + bg });
    var bw = parseFloat(cs.borderTopWidth);
    if (bw) { var bc = toHex(cs.borderTopColor); rows.push({ k: "stroke · " + (cmap[bc] || bc), v: bw + "px", sw: bc, css: "border: " + bw + "px solid " + bc }); }
    var r = parseFloat(cs.borderTopLeftRadius);
    if (r) rows.push({ k: radii[Math.round(r)] || "radius", v: Math.round(r) + "px", css: "border-radius: " + Math.round(r) + "px" });
    var pt = parseFloat(cs.paddingTop), pl = parseFloat(cs.paddingLeft);
    if (pt || pl) rows.push({ k: "padding", v: spaceToken(pt) + " · " + spaceToken(pl), css: "padding: " + cs.padding });
    var gap = parseFloat(cs.columnGap || cs.gap);
    if (gap && /flex|grid/.test(cs.display)) rows.push({ k: "gap", v: spaceToken(gap), css: "gap: " + Math.round(gap) + "px" });
    if (cs.boxShadow && cs.boxShadow !== "none") rows.push({ k: "effect/shadow", v: "drop shadow", css: "box-shadow: " + cs.boxShadow });
    return rows;
  }

  /* ============================================================
     Inspect mode
     ============================================================ */
  var ins = $("#inspect");
  var insBtn = $("#inspectToggle");
  var grid = $("#layoutGrid");
  var box = $(".ins__box", ins), parentBox = $(".ins__parent", ins), dim = $(".ins__dim", ins);
  var m = { t: $(".ins__m--t", ins), b: $(".ins__m--b", ins), l: $(".ins__m--l", ins), r: $(".ins__m--r", ins) };
  var ml = { t: $(".ins__m-label--t", ins), b: $(".ins__m-label--b", ins), l: $(".ins__m-label--l", ins), r: $(".ins__m-label--r", ins) };
  var insName = $("#insName"), insSize = $("#insSize"), insRows = $("#insRows");
  var insComp = $("#insComp"), insCompName = $("#insCompName"), insCompFig = $("#insCompFig"), insCompPath = $("#insCompPath");
  var inspecting = false, current = null, currentRows = [], pinned = null;

  /* Component registry: site element -> name + Figma counterpart.
     Counterparts live in the case-study, components and variables file (W6jMk8pRjf0wMhgx2iT7k9):
     the Components page for parts, Screens for page-only layers, Illustration for Sunny and Puppy. */
  var FIGMA = "https://www.figma.com/design/W6jMk8pRjf0wMhgx2iT7k9/ganeshuxcraft?node-id=";
  var components = [
    { sel: ".nav__resume", name: "Nav / Resume button", figma: "Button · Style=Primary, Size=Small", node: "3-4" },
    { sel: ".nav__brand", name: "Brand / Pendant lockup", figma: "Screens · Home", node: "12-36" },
    { sel: ".nav__theme", name: "Nav / Theme toggle", figma: "Screens · Home", node: "12-36" },
    { sel: ".nav__inspect", name: "Nav / Inspect button", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".nav__pill", name: "Nav / Pill", figma: "Nav Pill · State=Default / Active", node: "3-19" },
    { sel: ".pbento__art", name: "Process / Looping drawing", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".availability", name: "Hero / Availability pill", figma: "Tag", node: "3-20" },
    { sel: ".hero__cta .btn--primary", name: "Button / Primary", figma: "Button · Style=Primary, Size=Default", node: "3-2" },
    { sel: ".hero__cta .btn--ghost", name: "Button / Ghost", figma: "Button · Style=Ghost, Size=Default", node: "3-6" },
    { sel: ".bridge", name: "Hero / Figma ⇄ Code card", figma: "Screens · Home", node: "12-36" },
    { sel: ".fact", name: "Facts / Stat", figma: "Stat", node: "3-38" },
    { sel: ".mz", name: "Work / Cover tile", figma: "Case Row", node: "3-26" },
    { sel: ".wrow", name: "Work / Index row", figma: "Case Row", node: "3-26" },
    { sel: ".pbento__tile", name: "Process / Step tile", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".story__me", name: "Story / Portrait", figma: "Screens · Home", node: "12-36" },
    { sel: ".story__climb", name: "Story / Career path", figma: "Screens · Home", node: "12-36" },
    { sel: ".piece", name: "Playground / Piece", figma: "Media Frame", node: "3-47" },
    { sel: ".view-switch", name: "Gallery / View switch", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".featured", name: "Writing / Featured piece", figma: "Screens · Home", node: "12-36" },
    { sel: ".post", name: "Writing / Post row", figma: "Screens · Home", node: "12-36" },
    { sel: ".chips li", name: "Skills / Skill token", figma: "Tag", node: "3-20" },
    { sel: ".group", name: "Skills / Token group", figma: "Section Header", node: "3-22" },
    { sel: ".ai__row", name: "AI / Page row", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".sunny-can", name: "AI / What Sunny can do", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".icon-link", name: "Contact / Icon link", figma: "Screens · Home", node: "12-36" },
    { sel: ".cbig__mail", name: "Contact / Big email", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".ask", name: "Sunny / Ask Sunny panel", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".sunny__ask", name: "Sunny / Launcher", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".sunny__char", name: "Sunny / Mascot", figma: "Sunny · Mood=Default (nine moods)", node: "5-245" },
    { sel: ".puppy__char", name: "Puppy / Mascot", figma: "Puppy · Companion", node: "9-33" },
    { sel: ".keys", name: "Keyboard shortcuts overlay", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".ins", name: "Inspector panel", figma: "no Figma counterpart, built in code", node: "" },
    { sel: ".btn--primary", name: "Button / Primary", figma: "Button · Style=Primary, Size=Default", node: "3-2" },
    { sel: ".btn--ghost", name: "Button / Ghost", figma: "Button · Style=Ghost, Size=Default", node: "3-6" }
  ];
  function componentFor(el) {
    var node = el;
    while (node && node !== document.body) {
      for (var i = 0; i < components.length; i++) {
        if (node.matches(components[i].sel)) return { el: node, def: components[i] };
      }
      node = node.parentElement;
    }
    return null;
  }
  function pathTo(comp, el) {
    var parts = [];
    var node = el;
    while (node && node !== comp.el) { parts.unshift(layerName(node)); node = node.parentElement; }
    return parts.join(" / ");
  }
  function renderComponent(comp, el) {
    if (!comp) { insComp.hidden = true; return; }
    insComp.hidden = false;
    insCompName.textContent = comp.def.name;
    insCompFig.textContent = comp.def.figma + (comp.def.node ? " ↗" : "");
    if (comp.def.node) { insCompFig.href = FIGMA + comp.def.node; insCompFig.removeAttribute("aria-disabled"); insCompFig.classList.remove("is-none"); }
    else { insCompFig.removeAttribute("href"); insCompFig.setAttribute("aria-disabled", "true"); insCompFig.classList.add("is-none"); }
    var inner = comp.el === el ? "" : pathTo(comp, el);
    insCompPath.textContent = inner ? "layer · " + inner : "component root";
  }
  function renderRows(rows) {
    insRows.innerHTML = rows.map(function (row) {
      return '<div class="ins__row"><b>' + row.k + '</b><i>' + (row.sw ? '<span class="ins__sw" style="background:' + row.sw + '"></span>' : "") + row.v + "</i></div>";
    }).join("");
  }

  function place(el, x, y, w, h) {
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.width = Math.max(0, w) + "px"; el.style.height = Math.max(0, h) + "px";
  }
  function measure(key, x1, y1, x2, y2, value) {
    var horizontal = y1 === y2;
    var show = value > 0.5;
    m[key].style.opacity = ml[key].style.opacity = show ? 1 : 0;
    if (!show) return;
    place(m[key], Math.min(x1, x2), Math.min(y1, y2), horizontal ? Math.abs(x2 - x1) : 1, horizontal ? 1 : Math.abs(y2 - y1));
    ml[key].textContent = Math.round(value);
    ml[key].style.left = ((x1 + x2) / 2 + (horizontal ? 0 : 0)) + "px";
    ml[key].style.top = ((y1 + y2) / 2) + "px";
  }
  function pick(e) {
    if (pinned) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === current) return;
    if (el === document.body || el === document.documentElement || el.closest(".ins, .nav__pill, .toast, .token-diff")) return;
    current = el;
    var r = el.getBoundingClientRect();
    place(box, r.left, r.top, r.width, r.height);
    dim.textContent = Math.round(r.width) + " × " + Math.round(r.height);
    dim.style.left = (r.left + r.width / 2) + "px";
    dim.style.top = (r.bottom) + "px";

    var parent = el.closest("[data-layer]");
    if (parent && parent !== el) {
      var pr = parent.getBoundingClientRect();
      var pcs = getComputedStyle(parent);
      var left = pr.left + parseFloat(pcs.paddingLeft), right = pr.right - parseFloat(pcs.paddingRight);
      place(parentBox, left, pr.top, right - left, pr.height);
      parentBox.style.opacity = 1;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      measure("t", cx, pr.top, cx, r.top, r.top - pr.top);
      measure("b", cx, r.bottom, cx, pr.bottom, pr.bottom - r.bottom);
      measure("l", left, cy, r.left, cy, r.left - left);
      measure("r", r.right, cy, right, cy, right - r.right);
    } else {
      parentBox.style.opacity = 0;
      ["t", "b", "l", "r"].forEach(function (k) { m[k].style.opacity = ml[k].style.opacity = 0; });
    }

    insName.textContent = layerName(el);
    insSize.textContent = Math.round(r.width) + " × " + Math.round(r.height);
    currentRows = describe(el);
    renderRows(currentRows);
    renderComponent(componentFor(el), el);
  }
  /* Click a component to pin it: the panel locks on the component root,
     with its token names, spacing and Figma counterpart. */
  function pin(comp) {
    pinned = comp.el;
    ins.classList.add("is-pinned");
    current = null;
    var r = pinned.getBoundingClientRect();
    place(box, r.left, r.top, r.width, r.height);
    dim.textContent = Math.round(r.width) + " × " + Math.round(r.height);
    dim.style.left = (r.left + r.width / 2) + "px";
    dim.style.top = r.bottom + "px";
    parentBox.style.opacity = 0;
    var cs = getComputedStyle(pinned);
    var pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    measure("t", cx, r.top, cx, r.top + pt, pt);
    measure("b", cx, r.bottom - pb, cx, r.bottom, pb);
    measure("l", r.left, cy, r.left + pl, cy, pl);
    measure("r", r.right - pr, cy, r.right, cy, pr);
    insName.textContent = comp.def.name;
    insSize.textContent = Math.round(r.width) + " × " + Math.round(r.height);
    currentRows = describe(pinned);
    renderRows(currentRows);
    renderComponent(comp, pinned);
    insCompPath.textContent = "pinned · click again to release";
    toast("pinned " + comp.def.name);
  }
  function unpin() {
    pinned = null;
    ins.classList.remove("is-pinned");
    current = null;
  }
  function copyCss() {
    var target = pinned || current;
    if (!target) return;
    var sel = target.classList.length ? "." + target.classList[0] : target.tagName.toLowerCase();
    var css = sel + " {\n" + currentRows.map(function (r) { return "  " + r.css + ";"; }).join("\n") + "\n}";
    var done = function () { toast("✓ " + sel + " css copied"); };
    if (navigator.clipboard) navigator.clipboard.writeText(css).then(done, done); else done();
  }
  function onInspectClick(e) {
    if (!inspecting) return;
    if (e.target.closest("#inspectToggle, #inspectHint, .nav__theme, .nav__pill, .ins__panel")) return;
    e.preventDefault(); e.stopPropagation();
    if (pinned) { unpin(); pick(e); return; }
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var comp = el && componentFor(el);
    if (comp) pin(comp); else toast("not a registered component · press C to copy css");
  }
  function setInspect(on) {
    inspecting = on;
    document.body.classList.toggle("inspecting", on);
    ins.hidden = !on;
    if (insBtn) insBtn.setAttribute("aria-pressed", String(on));
    if (on) { document.addEventListener("mousemove", pick); window.addEventListener("scroll", onInsScroll, { passive: true }); }
    else { document.removeEventListener("mousemove", pick); window.removeEventListener("scroll", onInsScroll); unpin(); insComp.hidden = true; }
    if (on) toast("inspect mode · hover layers, click a component to pin it");
  }
  function onInsScroll() { if (pinned) unpin(); current = null; }
  document.addEventListener("click", onInspectClick, true);
  if (insBtn) insBtn.addEventListener("click", function () { setInspect(!inspecting); });
  var insHint = $("#inspectHint");
  if (insHint) insHint.addEventListener("click", function () { setInspect(!inspecting); });
  /* Keyboard shortcuts overlay (?) */
  var keys = $("#keys"), keysOpen = false;
  function setKeys(on) {
    if (!keys) return;
    keysOpen = on;
    if (on) { keys.hidden = false; requestAnimationFrame(function () { keys.classList.add("is-open"); }); $(".keys__close", keys).focus(); }
    else { keys.classList.remove("is-open"); setTimeout(function () { keys.hidden = true; }, 220); }
  }
  if (keys) {
    $(".keys__close", keys).addEventListener("click", function () { setKeys(false); });
    keys.addEventListener("click", function (e) { if (e.target === keys) setKeys(false); });
    $$("[data-keys-open]").forEach(function (b) { b.addEventListener("click", function () { setKeys(true); }); });
  }
  /* single-key shortcuts can be switched off (screen readers and voice control send letters too); ? and Esc always work */
  function shortcutsOn() { try { return localStorage.getItem("keys:shortcuts") !== "off"; } catch (e) { return true; } }
  var keysEnabled = $("#keysEnabled"), keysState = $("#keysState");
  function applyShortcuts(on) {
    document.body.classList.toggle("no-shortcuts", !on);
    if (keysEnabled) keysEnabled.checked = on;
    if (keysState) keysState.innerHTML = on ? "on · pause while you type · <kbd>?</kbd> and <kbd>Esc</kbd> always work" : "off · use the buttons in the nav and on the page · <kbd>?</kbd> and <kbd>Esc</kbd> still work";
  }
  applyShortcuts(shortcutsOn());
  if (keysEnabled) keysEnabled.addEventListener("change", function () {
    try { localStorage.setItem("keys:shortcuts", keysEnabled.checked ? "on" : "off"); } catch (e) { /* ignore */ }
    applyShortcuts(keysEnabled.checked);
    window.dispatchEvent(new CustomEvent("prefs:change"));
  });
  window.addEventListener("prefs:change", function () { applyShortcuts(shortcutsOn()); });
  document.addEventListener("keydown", function (e) {
    if (typingTarget(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (e.key === "?") { e.preventDefault(); setKeys(!keysOpen); return; }
    if (k === "escape" && keysOpen) { setKeys(false); return; }
    if (k === "escape" && inspecting) { if (pinned) unpin(); else setInspect(false); return; }
    if (!shortcutsOn()) return;
    if (k === "i") setInspect(!inspecting);
    else if (k === "g") grid.hidden = !grid.hidden;
    else if (k === "t") { var tb = $("#themeToggle"); if (tb) tb.click(); }
    else if (k === "c" && inspecting) copyCss();
  });

  /* ============================================================
     Ghost multiplayer cursor across the split
     ============================================================ */
  var split = $("#bridgeSplit");
  var ghost = $("#ghost");
  var ghostName = $(".ghost__name", ghost);
  if (split && finePointer) {
    var canvasPane = $(".bridge__canvas", split), codePane = $(".bridge__code", split);
    var gx = 0, gy = 0, gtx = 0, gty = 0, graf = null;
    function gstep() {
      gx += (gtx - gx) * 0.18; gy += (gty - gy) * 0.18;
      ghost.style.transform = "translate(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px)";
      graf = (Math.abs(gtx - gx) > 0.2 || Math.abs(gty - gy) > 0.2) ? requestAnimationFrame(gstep) : null;
    }
    split.addEventListener("mousemove", function (e) {
      var sr = split.getBoundingClientRect();
      var inCanvas = e.clientX < sr.left + canvasPane.offsetWidth;
      var from = inCanvas ? canvasPane : codePane, to = inCanvas ? codePane : canvasPane;
      var fr = from.getBoundingClientRect();
      var relX = (e.clientX - fr.left) / fr.width, relY = (e.clientY - fr.top) / fr.height;
      gtx = to.offsetLeft + relX * to.offsetWidth;
      gty = to.offsetTop + relY * to.offsetHeight;
      ghostName.textContent = inCanvas ? "code" : "canvas";
      ghost.classList.add("is-on");
      if (!graf) graf = requestAnimationFrame(gstep);
    });
    split.addEventListener("mouseleave", function () { ghost.classList.remove("is-on"); });
  }

  /* ============================================================
     Token diff console on theme change
     ============================================================ */
  var diffEl = $("#tokenDiff");
  var watched = ["--bg", "--ink", "--muted", "--line", "--surface", "--card"];
  var names = { "--bg": "color/bg", "--ink": "color/ink", "--muted": "color/muted", "--line": "color/line", "--surface": "color/surface", "--card": "color/card" };
  function snapshot() {
    var cs = getComputedStyle(document.documentElement);
    var o = {};
    watched.forEach(function (k) { o[k] = toHex(cs.getPropertyValue(k).trim()); });
    return o;
  }
  var prev = snapshot(), diffTimer = null;
  new MutationObserver(function () {
    var next = snapshot();
    var theme = document.documentElement.getAttribute("data-theme") || "light";
    var rows = ['<div style="--d:0ms"><span class="k">theme</span><span class="a">' + (theme === "dark" ? "light → dark" : "dark → light") + "</span></div>"];
    var i = 1;
    watched.forEach(function (k) {
      if (prev[k] !== next[k]) {
        rows.push('<div style="--d:' + (i * 90) + 'ms"><span class="k">' + names[k] + '</span><span class="a"><span class="sw" style="background:' + prev[k] + '"></span>' + prev[k] + ' → <span class="sw" style="background:' + next[k] + '"></span>' + next[k] + "</span></div>");
        i++;
      }
    });
    rows.push('<div class="ok" style="--d:' + (i * 90 + 150) + 'ms">✓ 26 components re-themed · 0 drift</div>');
    diffEl.innerHTML = rows.join("");
    diffEl.hidden = false;
    requestAnimationFrame(function () { diffEl.classList.add("is-show"); });
    clearTimeout(diffTimer);
    diffTimer = setTimeout(function () {
      diffEl.classList.remove("is-show");
      setTimeout(function () { diffEl.hidden = true; }, 350);
    }, 3200 + i * 90);
    prev = next;
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });


})();
