/* Creative layer: inspect mode, layout grid, ghost cursor,
   token diff console, glitch portrait, gallery desk mode. */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    var name = /Fraunces/i.test(fam) ? (size >= 60 ? "type/display" : size >= 40 ? "type/h1" : size >= 24 ? "type/h2" : "type/serif")
      : /JetBrains/i.test(fam) ? "type/mono" : size >= 17 ? "type/lead" : size <= 12 ? "type/caption" : "type/body";
    var lh = cs.lineHeight === "normal" ? "" : " / " + (Math.round(parseFloat(cs.lineHeight) / size * 100) / 100);
    return { name: name, value: fam + " " + Math.round(size) + lh };
  }
  function layerName(el) {
    if (el.dataset.layer) return el.dataset.layer;
    var cls = Array.prototype.find.call(el.classList, function (c) { return !/^(is-|mono|w$|w--)/.test(c); });
    if (!cls) return el.tagName.toLowerCase();
    return cls.split("__").map(function (p) {
      return p.split("--")[0].replace(/-/g, " ").replace(/^\w/, function (m) { return m.toUpperCase(); });
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
  var inspecting = false, current = null, currentRows = [];

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
    insRows.innerHTML = currentRows.map(function (row) {
      return '<div class="ins__row"><b>' + row.k + '</b><i>' + (row.sw ? '<span class="ins__sw" style="background:' + row.sw + '"></span>' : "") + row.v + "</i></div>";
    }).join("");
  }
  function copyCss(e) {
    if (!inspecting) return;
    if (e.target.closest("#inspectToggle, .nav__theme")) return;
    e.preventDefault(); e.stopPropagation();
    if (!current) return;
    var sel = current.classList.length ? "." + current.classList[0] : current.tagName.toLowerCase();
    var css = sel + " {\n" + currentRows.map(function (r) { return "  " + r.css + ";"; }).join("\n") + "\n}";
    var done = function () { toast("✓ " + sel + " css copied"); };
    if (navigator.clipboard) navigator.clipboard.writeText(css).then(done, done); else done();
  }
  function setInspect(on) {
    inspecting = on;
    document.body.classList.toggle("inspecting", on);
    ins.hidden = !on;
    insBtn.setAttribute("aria-pressed", String(on));
    if (on) { document.addEventListener("mousemove", pick); window.addEventListener("scroll", onInsScroll, { passive: true }); }
    else { document.removeEventListener("mousemove", pick); window.removeEventListener("scroll", onInsScroll); current = null; }
    if (on) toast("inspect mode · hover layers, click to copy css");
  }
  function onInsScroll() { current = null; }
  document.addEventListener("click", copyCss, true);
  insBtn.addEventListener("click", function () { setInspect(!inspecting); });
  document.addEventListener("keydown", function (e) {
    if (typingTarget(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === "i") setInspect(!inspecting);
    else if (k === "g") grid.hidden = !grid.hidden;
    else if (k === "escape" && inspecting) setInspect(false);
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
    rows.push('<div class="ok" style="--d:' + (i * 90 + 150) + 'ms">✓ 48 components re-themed · 0 drift</div>');
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

  /* ============================================================
     Glitch portrait: slice offsets + RGB split on entrance,
     small bursts on hover
     ============================================================ */
  var gcanvas = $("#glitch");
  var portrait = $("#portraitImg");
  var frame = gcanvas && gcanvas.parentElement;
  if (gcanvas && portrait) {
    var gctx = gcanvas.getContext("2d");
    var base = document.createElement("canvas"), red = document.createElement("canvas"), blue = document.createElement("canvas");
    var gw = 0, gh = 0, burstEnd = 0, burstAmt = 0, entrance = false, entranceStart = 0, graf2 = null, hovering = false, lastMove = 0, lastX = 0, lastY = 0;

    function coverDraw(ctx2, w, h) {
      var iw = portrait.naturalWidth, ih = portrait.naturalHeight;
      var scale = Math.max(w / iw, h / ih), sw = w / scale, sh = h / scale;
      ctx2.drawImage(portrait, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, w, h);
    }
    function tint(src, dst, color) {
      dst.width = src.width; dst.height = src.height;
      var c = dst.getContext("2d");
      c.drawImage(src, 0, 0);
      c.globalCompositeOperation = "multiply";
      c.fillStyle = color; c.fillRect(0, 0, dst.width, dst.height);
      c.globalCompositeOperation = "destination-in";
      c.drawImage(src, 0, 0);
    }
    function prepare() {
      gw = Math.round(frame.clientWidth); gh = Math.round(frame.clientHeight);
      if (!gw || !gh || !portrait.naturalWidth) return false;
      gcanvas.width = gw; gcanvas.height = gh;
      base.width = gw; base.height = gh;
      coverDraw(base.getContext("2d"), gw, gh);
      tint(base, red, "#ff2a2a");
      tint(base, blue, "#2a6bff");
      return true;
    }
    function drawGlitch(amt) {
      var x = gctx;
      x.clearRect(0, 0, gw, gh);
      x.drawImage(base, 0, 0);
      var shift = 3 + 9 * amt;
      x.globalCompositeOperation = "screen";
      x.globalAlpha = 0.55 + 0.35 * amt;
      x.drawImage(red, -shift, 0);
      x.drawImage(blue, shift, 0);
      x.globalAlpha = 1;
      x.globalCompositeOperation = "source-over";
      var slices = 3 + Math.round(6 * amt);
      for (var i = 0; i < slices; i++) {
        var sy = Math.random() * gh, sh = 4 + Math.random() * (14 + 40 * amt);
        var off = (Math.random() - 0.5) * 70 * amt;
        x.drawImage(base, 0, sy, gw, sh, off, sy, gw, sh);
        if (Math.random() < 0.5) x.drawImage(red, 0, sy, gw, sh, off + shift * 1.5, sy, gw, sh);
      }
      if (Math.random() < 0.4 * amt) {
        x.fillStyle = "rgba(255,255,255," + (0.08 + 0.12 * amt) + ")";
        x.fillRect(0, Math.random() * gh, gw, 1 + Math.random() * 2);
      }
    }
    function gtick(now) {
      var amt = 0;
      if (entrance) {
        var p = (now - entranceStart) / 1100;
        if (p >= 1) entrance = false; else amt = Math.pow(1 - p, 1.4) * (0.6 + 0.4 * Math.random());
      }
      if (now < burstEnd) amt = Math.max(amt, burstAmt * (0.5 + 0.5 * Math.random()));
      if (amt > 0.02) {
        drawGlitch(amt);
        gcanvas.classList.add("is-on");
        graf2 = requestAnimationFrame(gtick);
      } else {
        gcanvas.classList.remove("is-on");
        gctx.clearRect(0, 0, gw, gh);
        graf2 = null;
      }
    }
    function gstart() { if (!graf2) graf2 = requestAnimationFrame(gtick); }
    function burst(ms, amt) { burstEnd = Math.max(burstEnd, performance.now() + ms); burstAmt = amt; gstart(); }
    function playEntrance() {
      if (reduced || !prepare()) return;
      entrance = true; entranceStart = performance.now(); gstart();
    }

    var gstarted = false;
    function arm() {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en, io) {
          if (en[0].isIntersecting && !gstarted) { gstarted = true; playEntrance(); io.disconnect(); }
        }, { threshold: 0.35 }).observe(frame);
      }
    }
    if (portrait.complete && portrait.naturalWidth) arm(); else portrait.addEventListener("load", arm);
    window.addEventListener("resize", function () { if (gstarted) prepare(); });

    if (finePointer && !reduced) {
      var hoverTimer = null;
      var scheduleBurst = function () {
        clearTimeout(hoverTimer);
        if (!hovering) return;
        hoverTimer = setTimeout(function () {
          if (!hovering) return;
          if (!gw) prepare();
          burst(120 + Math.random() * 140, 0.45 + Math.random() * 0.3);
          scheduleBurst();
        }, 900 + Math.random() * 1800);
      };
      frame.addEventListener("mouseenter", function () { hovering = true; if (!gw) prepare(); burst(160, 0.5); scheduleBurst(); });
      frame.addEventListener("mouseleave", function () { hovering = false; clearTimeout(hoverTimer); });
      frame.addEventListener("mousemove", function (e) {
        var now = performance.now(), dt = now - lastMove;
        var speed = dt ? Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt : 0;
        lastMove = now; lastX = e.clientX; lastY = e.clientY;
        if (speed > 1.4) burst(90, Math.min(0.8, speed * 0.3));
      });
    }
  }

  /* ============================================================
     Gallery desk mode (scatter + drag)
     ============================================================ */
  var deskBtn = $("#deskToggle");
  var gallery = $(".gallery__grid");
  var pieces = $$(".piece", gallery);
  var isDesk = false, dragState = null, suppressClick = false;

  function flip(before, apply) {
    apply();
    pieces.forEach(function (p, i) {
      var a = before[i], b = p.getBoundingClientRect();
      var dx = a.left - b.left, dy = a.top - b.top, sx = a.width / b.width, sy = a.height / b.height;
      if (reduced) return;
      p.animate(
        [{ transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ") " + (isDesk ? "" : "rotate(" + (p.dataset.rot || 0) + "deg)"), transformOrigin: "0 0" },
         { transform: isDesk ? "rotate(" + p.dataset.rot + "deg)" : "none", transformOrigin: "0 0" }],
        { duration: 650 + i * 12, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
      );
    });
  }
  function toDesk() {
    var before = pieces.map(function (p) { return p.getBoundingClientRect(); });
    var W = gallery.clientWidth, H = Math.max(820, Math.min(1100, window.innerHeight * 0.95));
    var scrollBefore = window.scrollY;
    flip(before, function () {
      isDesk = true;
      gallery.classList.add("is-desk");
      gallery.style.height = H + "px";
      pieces.forEach(function (p, i) {
        var rot = (Math.random() * 16 - 8).toFixed(1);
        var x = Math.random() * (W - 260), y = Math.random() * (H - 260);
        p.dataset.rot = rot;
        p.style.left = x + "px"; p.style.top = y + "px"; p.style.zIndex = i + 1;
        p.style.transform = "rotate(" + rot + "deg)";
      });
    });
    window.scrollTo(0, scrollBefore);
    deskBtn.innerHTML = "view: grid ⇄ <b>desk</b>";
    deskBtn.setAttribute("aria-pressed", "true");
    toast("desk mode · drag the prints around");
  }
  function toGrid() {
    var before = pieces.map(function (p) { return p.getBoundingClientRect(); });
    flip(before, function () {
      isDesk = false;
      gallery.classList.remove("is-desk");
      gallery.style.height = "";
      pieces.forEach(function (p) { p.style.cssText = ""; p.removeAttribute("data-rot"); });
    });
    deskBtn.innerHTML = "view: <b>grid</b> ⇄ desk";
    deskBtn.setAttribute("aria-pressed", "false");
  }
  if (deskBtn) {
    deskBtn.addEventListener("click", function () { isDesk ? toGrid() : toDesk(); });
    var zTop = 100;
    pieces.forEach(function (p) {
      p.addEventListener("pointerdown", function (e) {
        if (!isDesk || e.button !== 0) return;
        var r = gallery.getBoundingClientRect();
        dragState = { p: p, ox: e.clientX - p.offsetLeft, oy: e.clientY - p.offsetTop, sx: e.clientX, sy: e.clientY, moved: false, gr: r };
        p.style.zIndex = ++zTop;
        p.setPointerCapture(e.pointerId);
      });
      p.addEventListener("pointermove", function (e) {
        if (!dragState || dragState.p !== p) return;
        if (!dragState.moved && Math.hypot(e.clientX - dragState.sx, e.clientY - dragState.sy) > 4) {
          dragState.moved = true; p.classList.add("is-dragging");
        }
        if (!dragState.moved) return;
        var x = Math.max(-40, Math.min(gallery.clientWidth - 210, e.clientX - dragState.ox));
        var y = Math.max(-40, Math.min(gallery.clientHeight - 200, e.clientY - dragState.oy));
        p.style.left = x + "px"; p.style.top = y + "px";
      });
      var end = function (e) {
        if (!dragState || dragState.p !== p) return;
        if (dragState.moved) { suppressClick = true; setTimeout(function () { suppressClick = false; }, 0); }
        p.classList.remove("is-dragging");
        dragState = null;
      };
      p.addEventListener("pointerup", end);
      p.addEventListener("pointercancel", end);
      p.addEventListener("click", function (e) { if (suppressClick) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    });
  }
})();
