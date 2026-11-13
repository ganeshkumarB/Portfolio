/* Portfolio mascots: eight small characters, one per section.
   Each mascot is an inline SVG (220x220 artboard from Figma "Mascot concepts v2")
   with named parts so CSS can animate them. Usage:

     <span class="m-wrap" data-mascot="orb" data-size="120"></span>
     <script src="mascots.js"></script>

   Mascots.mount() fills every [data-mascot] element, reveals each one once as it
   scrolls into view (IntersectionObserver) and wires the few hover / pointer
   behaviours that CSS alone cannot do. Decorative only: aria-hidden everywhere.
*/
(function (global) {
  "use strict";

  var SUN = "#FFC93C", INK = "#111111", PAPER = "#FFFFFF", GREY = "#8a8a8a";
  var MONO = "font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-weight:500";

  function sphereGrad(id, cx, cy, r) {
    return '<radialGradient id="' + id + '" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(' + cx + ' ' + cy + ') scale(' + r + ')"><stop stop-color="#FFE48A"/><stop offset="1" stop-color="#F2AE2E"/></radialGradient>';
  }
  function eyes(x1, x2, y, w, h, fill, extra) {
    var rx = w / 2;
    function eye(x) {
      /* closed-happy arc: same colour, stroke as wide as the eye, drawn over the top third */
      var arc = '<path class="m-eye-happy" d="M' + (x - 1) + ' ' + (y + h * 0.6) + ' Q' + (x + w / 2) + ' ' + (y + h * 0.05) + ' ' + (x + w + 1) + ' ' + (y + h * 0.6) + '" fill="none" stroke="' + fill + '" stroke-width="' + w + '" stroke-linecap="round"/>';
      return '<g class="m-eye-g"><rect class="m-eye" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + fill + '"/>' + arc + '</g>';
    }
    return '<g class="m-look"><g class="m-eyes"' + (extra || "") + '>' + eye(x1) + eye(x2) + '</g></g>';
  }
  function shadow(cx, rx) {
    return '<ellipse class="m-shadow" cx="' + cx + '" cy="209" rx="' + rx + '" ry="5" fill="' + INK + '" fill-opacity="0.08"/>';
  }
  function svg(name, inner, defs) {
    return '<svg class="mascot mascot--' + name + '" viewBox="0 0 220 220" aria-hidden="true" focusable="false" overflow="visible">' +
      (defs ? "<defs>" + defs + "</defs>" : "") + inner + "</svg>";
  }

  var ART = {
    /* char/01 · Orb (794:32) */
    orb: function () {
      return svg("orb",
        shadow(110, 38) +
        '<g class="m-body">' +
          '<circle class="m-sphere" cx="110" cy="108" r="60" fill="url(#m-orb-grad)"/>' +
          '<g transform="translate(93.74 68.52) rotate(-20)"><ellipse class="m-highlight" rx="17" ry="11" fill="' + PAPER + '" fill-opacity="0.75" filter="url(#m-orb-blur)"/></g>' +
          eyes(94, 118, 96, 9, 16, INK) +
        '</g>' +
        '<g transform="translate(104.75 134)"><g class="m-orbit-tilt">' +
          '<ellipse class="m-orbit" rx="92.5" ry="20.5" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
          '<g transform="scale(1 0.2216)"><g class="m-sat-spin"><g transform="translate(92.5 0) scale(1 4.5126)"><circle class="m-satellite" r="5" fill="' + INK + '"/></g></g></g>' +
        '</g></g>',
        sphereGrad("m-orb-grad", 110, 108, 60) +
        '<filter id="m-orb-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>');
    },

    /* char/02 · Cursor (794:41) */
    cursor: function () {
      return svg("cursor",
        shadow(81, 35) +
        '<g class="m-body">' +
          '<g transform="translate(37.5 21.5)"><g class="m-pointer" filter="url(#m-cursor-shadow)">' +
            '<path d="M14.5 8.5V112.5L42.5 86.5L62.5 128.5L80.5 120.5L61.5 80.5H98.5L14.5 8.5Z" fill="' + INK + '" stroke="' + PAPER + '" stroke-width="5" stroke-linejoin="round"/>' +
          '</g></g>' +
          eyes(60, 76, 72, 7, 13, PAPER) +
        '</g>' +
        '<g class="m-tag">' +
          '<rect x="120" y="118" width="80" height="26" rx="8" fill="' + SUN + '"/>' +
          '<text x="131" y="135.5" font-size="12" fill="' + INK + '" style="' + MONO + '">ganesh</text>' +
        '</g>',
        '<filter id="m-cursor-shadow" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.12"/></filter>');
    },

    /* char/03 · Anchor (794:50) */
    anchor: function () {
      return svg("anchor",
        shadow(110, 40) +
        '<g class="m-arm m-arm--l">' +
          '<path d="M24 80L68 110" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
          '<circle class="m-knob" cx="23" cy="81" r="8" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2"/>' +
        '</g>' +
        '<g class="m-arm m-arm--r">' +
          '<path d="M152 110L196 140" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
          '<circle class="m-knob" cx="197" cy="141" r="8" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2"/>' +
        '</g>' +
        '<g class="m-body">' +
          '<rect class="m-node" x="69.5" y="69.5" width="81" height="81" rx="8.5" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>' +
          eyes(96, 116, 98, 9, 16, INK) +
        '</g>' +
        '<g class="m-dim">' +
          '<rect x="80" y="166" width="60" height="20" rx="6" fill="' + INK + '"/>' +
          '<text class="m-dim-text" x="110" y="180" font-size="10" fill="' + PAPER + '" text-anchor="middle" style="' + MONO + '">84×84</text>' +
        '</g>');
    },

    /* char/05 · Token (794:73) */
    token: function () {
      return svg("token",
        shadow(115, 45) +
        '<g class="m-swing">' +
          '<path class="m-string" d="M38 26C58 46 64.667 73.333 58 108" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>' +
          '<rect class="m-token-body" x="37" y="83" width="148" height="62" rx="31" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2"/>' +
          '<circle cx="59" cy="113" r="6" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' +
          eyes(118, 140, 98, 9, 16, INK) +
        '</g>' +
        '<text class="m-label" x="58" y="171" font-size="11" fill="' + GREY + '" style="' + MONO + '">color/sun-500</text>');
    },

    /* char/07 · Nib (794:97) */
    nib: function () {
      return svg("nib",
        '<path class="m-ink" pathLength="1" d="M30 188.276C70 158.276 100 198.276 110 182.276C130 162.276 170 198.276 200 178.276" fill="none" stroke="#F2AE2E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<g class="m-body">' +
          '<path d="M70 18H150V72C150 93.333 136.667 125.333 110 168C83.333 125.333 70 93.333 70 72V18Z" fill="' + INK + '"/>' +
          '<rect x="66" y="10" width="88" height="14" rx="4" fill="' + INK + '"/>' +
          '<path d="M110 96V162" stroke="' + PAPER + '" stroke-width="2" stroke-linecap="round"/>' +
          '<circle cx="110" cy="90" r="8" fill="' + SUN + '"/>' +
          eyes(92, 118, 44, 8, 15, PAPER) +
        '</g>' +
        '<g transform="translate(103 176)"><path class="m-drop" d="M7 0C11.667 6.667 14 11.333 14 14C14 18 11.667 20 7 20C2.333 20 0 18 0 14C0 11.333 2.333 6.667 7 0Z" fill="#F2AE2E"/></g>');
    },

    /* char/08 · Bridge (794:107) */
    bridge: function () {
      return svg("bridge",
        '<g class="m-sun-lift"><circle class="m-sun" cx="110" cy="146" r="32" fill="url(#m-bridge-grad)"/></g>' +
        '<g class="m-body">' +
          '<path class="m-arch" transform="translate(30 60)" d="M0 0H160V84H138C136.667 53.333 117.333 38 80 38C42.667 38 23.333 53.333 22 84H0V0Z" fill="' + INK + '"/>' +
          eyes(96, 116, 70, 8, 14, PAPER) +
        '</g>' +
        '<g transform="translate(39.25 189.25)"><path class="m-wave" d="M0.75 2.75C7.417 0.083 14.083 0.083 20.75 2.75C27.417 5.417 34.083 5.417 40.75 2.75" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/></g>' +
        '<g transform="translate(139.25 189.25)"><path class="m-wave m-wave--2" d="M0.75 2.75C7.417 0.083 14.083 0.083 20.75 2.75C27.417 5.417 34.083 5.417 40.75 2.75" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/></g>' +
        '<text x="22" y="213" font-size="10" fill="' + GREY + '" style="' + MONO + '">figma</text>' +
        '<text x="166" y="213" font-size="10" fill="' + GREY + '" style="' + MONO + '">code</text>',
        sphereGrad("m-bridge-grad", 110, 146, 32));
    },

    /* char/09 · Spark (794:119) */
    spark: function () {
      return svg("spark",
        shadow(110, 36) +
        '<g class="m-body">' +
          '<path class="m-star" transform="translate(49.88 43.88)" d="M60.124 0.124C64.124 40.124 80.124 56.124 120.124 60.124C80.124 64.124 64.124 80.124 60.124 120.124C56.124 80.124 40.124 64.124 0.124 60.124C40.124 56.124 56.124 40.124 60.124 0.124Z" fill="url(#m-spark-grad)" stroke="' + INK + '" stroke-width="2.5"/>' +
          eyes(98, 114, 92, 7, 13, INK) +
        '</g>' +
        '<g transform="translate(160 30)"><path class="m-mini m-mini--1" d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="' + INK + '"/></g>' +
        '<g transform="translate(34 150)"><path class="m-mini m-mini--2" d="M8 0C9 5 11 7 16 8C11 9 9 11 8 16C7 11 5 9 0 8C5 7 7 5 8 0Z" fill="#F2AE2E"/></g>',
        sphereGrad("m-spark-grad", 110, 104, 60));
    },

    /* char/10 · Swatch (794:127) */
    swatch: function () {
      return svg("swatch",
        shadow(115, 45) +
        '<g transform="translate(115.93 114.87)"><rect class="m-card m-card--ink" x="-36" y="-62" width="72" height="124" rx="12" fill="' + INK + '"/></g>' +
        '<g transform="translate(111.81 107.22)"><rect class="m-card m-card--paper" x="-35" y="-61" width="70" height="122" rx="11" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/></g>' +
        '<g transform="translate(102.22 106.81)"><g class="m-card m-card--sun">' +
          '<rect x="-35" y="-61" width="70" height="122" rx="11" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2"/>' +
          eyes(-13, 9, -31, 9, 16, INK) +
          '<rect x="-28" y="30" width="56" height="18" rx="4" fill="' + PAPER + '"/>' +
          '<text x="0" y="42.5" font-size="9" fill="' + INK + '" text-anchor="middle" style="' + MONO + '">#FFC93C</text>' +
        '</g></g>');
    }
  };

  var reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mountOne(el) {
    var name = el.getAttribute("data-mascot");
    if (!ART[name] || el.getAttribute("data-mounted")) return;
    el.innerHTML = ART[name]();
    var size = el.getAttribute("data-size");
    if (size) { el.style.width = size + "px"; el.style.height = size + "px"; }
    el.classList.add("m-wrap", "m-wrap--" + name);
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("data-mounted", "1");
    track(el);
    mounted.push(el);
    if (name !== "cursor") wireClicks(el);
    if (name === "cursor") el.addEventListener("m:in", function () { clickBeat(el); });
  }

  /* ---- Emotions ----
     Ten expressions made from the two pill eyes plus body language. emote()
     sets data-emotion on the wrapper for a while; mascots.css draws the face.
     Triggers: random idle emotes, pointer approach / arrival / departure,
     a long pointer pause (sleepy), clicks and rapid clicks. */
  var EMOTIONS = { happy: 1800, surprised: 1200, curious: 2200, wink: 900, sleepy: 20000, shy: 1800, excited: 1600, dizzy: 1800, angry: 1400, sad: 2400,
    wave: 1700, squint: 1500, whoa: 900, bored: 2600, suspicious: 2000, proud: 2000 };
  var IDLE_POOL = ["happy", "curious", "wink", "shy", "curious", "happy", "surprised"];
  var mounted = [];

  function emote(el, name, ms) {
    if (reduced || !EMOTIONS[name]) return;
    clearTimeout(el._emoteTimer);
    el.removeAttribute("data-emotion");
    void el.offsetWidth; /* restart body animation */
    el.setAttribute("data-emotion", name);
    el._emoteUntil = Date.now() + (ms || EMOTIONS[name]);
    el._emoteTimer = setTimeout(function () { el.removeAttribute("data-emotion"); el._emoteUntil = 0; }, ms || EMOTIONS[name]);
  }
  function isEmoting(el) { return el._emoteUntil && Date.now() < el._emoteUntil; }
  function onScreen(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < global.innerHeight; }
  function emoteAll(name) { mounted.forEach(function (el) { if (onScreen(el)) emote(el, name); }); }

  /* Idle emotes: roughly one every 12-15 s per visible mascot */
  var idleTicker = 0;
  function startIdle() {
    if (reduced || idleTicker) return;
    idleTicker = setInterval(function () {
      if (document.hidden) return;
      mounted.forEach(function (el) {
        if (!el.classList.contains("is-in") || isEmoting(el) || !onScreen(el)) return;
        if (Math.random() < 0.18) emote(el, IDLE_POOL[Math.floor(Math.random() * IDLE_POOL.length)]);
      });
    }, 2500);
  }

  /* Clicks: one tap = excited, a double = dizzy, three fast taps = angry */
  function wireClicks(el) {
    if (reduced) return;
    var taps = [], downAt = 0;
    el.addEventListener("click", function () {
      var now = Date.now();
      taps = taps.filter(function (t) { return now - t < 1500; });
      taps.push(now);
      emote(el, taps.length >= 3 ? "angry" : taps.length === 2 ? "dizzy" : "excited");
    });
    /* press and hold: squeezed while held, pops back excited on release */
    el.addEventListener("pointerdown", function () { downAt = Date.now(); el.classList.add("is-held"); });
    function release() {
      if (!el.classList.contains("is-held")) return;
      el.classList.remove("is-held");
      if (Date.now() - downAt > 450) emote(el, "excited");
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("pointerleave", release);
    /* right-click: suspicious */
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); emote(el, "suspicious"); });
  }

  /* Sleepy after the pointer rests for a while; startled awake when it moves */
  var sleepTimer = 0, boredTimer = 0, asleep = false;
  function armSleep() {
    clearTimeout(sleepTimer); clearTimeout(boredTimer);
    boredTimer = setTimeout(function () {
      mounted.forEach(function (el) { if (onScreen(el) && el.classList.contains("is-in") && !isEmoting(el) && Math.random() < 0.6) emote(el, "bored"); });
    }, 5500);
    sleepTimer = setTimeout(function () {
      asleep = true;
      mounted.forEach(function (el) { if (onScreen(el) && el.classList.contains("is-in")) emote(el, "sleepy"); });
    }, 9000);
  }
  function wakeUp() {
    if (!asleep) return;
    asleep = false;
    mounted.forEach(function (el) { if (el.getAttribute("data-emotion") === "sleepy") emote(el, "surprised"); });
  }

  /* Pointer tracking: every mounted mascot looks at the pointer (eyes), leans
     toward it (body) and gets .is-near when it comes within reach. Values are
     written as CSS custom properties so the reactions live in mascots.css. */
  var tracked = [], px = -1e4, py = -1e4, raf = 0, awakeTimer = 0, lastX = 0, lastY = 0, lastT = 0, speed = 0;
  var lastDx = 0, reversals = [], shaking = false;
  var canTrack = !reduced && global.matchMedia && global.matchMedia("(pointer: fine)").matches;

  function track(el) {
    if (!canTrack) return;
    tracked.push(el);
    if (tracked.length === 1) {
      global.addEventListener("pointermove", onPointer, { passive: true });
      global.addEventListener("scroll", schedule, { passive: true });
    }
  }
  function onPointer(e) {
    var now = performance.now();
    if (lastT) { var dt = Math.max(8, now - lastT); speed = Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt; }
    var dx = e.clientX - lastX;
    if (dx * lastDx < 0 && Math.abs(dx) > 6) reversals.push(now);
    if (dx !== 0) lastDx = dx;
    reversals = reversals.filter(function (t) { return now - t < 700; });
    shaking = reversals.length >= 4;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    px = e.clientX; py = e.clientY;
    wakeUp(); armSleep();
    document.documentElement.classList.add("m-awake");
    clearTimeout(awakeTimer);
    awakeTimer = setTimeout(function () { document.documentElement.classList.remove("m-awake"); }, 420);
    schedule();
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }
  function update() {
    raf = 0;
    var vh = global.innerHeight;
    for (var i = 0; i < tracked.length; i++) {
      var el = tracked[i], r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1;
      var nx = Math.max(-1, Math.min(1, dx / 320)), ny = Math.max(-1, Math.min(1, dy / 320));
      el.style.setProperty("--mx", nx.toFixed(3));
      el.style.setProperty("--my", ny.toFixed(3));
      if (el.classList.contains("m-wrap--cursor")) chase(el, r);
      var near = d < Math.max(160, r.width * 1.4), wasNear = el.classList.contains("is-near");
      if (near && shaking && el.getAttribute("data-emotion") !== "dizzy") { emote(el, "dizzy"); reversals = []; shaking = false; }
      if (near !== wasNear) {
        el.classList.toggle("is-near", near);
        if (near) { el._nearSince = Date.now(); if (!isEmoting(el)) emote(el, speed > 1.6 ? "surprised" : "happy"); }
        else if (Date.now() - (el._nearSince || 0) > 2500 && !isEmoting(el)) emote(el, "sad");
      } else if (!near && speed > 2.2 && d < 300 && !isEmoting(el)) emote(el, "surprised");
    }
  }

  /* Cursor: after gliding in, press the target it points at (data-target selector) */
  function clickBeat(el, delay) {
    var sel = el.getAttribute("data-target"), target = sel ? document.querySelector(sel) : null;
    setTimeout(function () {
      el.classList.add("is-click");
      if (target) target.classList.add("is-pressed");
      setTimeout(function () {
        el.classList.remove("is-click");
        if (target) target.classList.remove("is-pressed");
      }, 220);
    }, reduced ? 0 : (delay == null ? 1100 : delay));
  }

  /* Cursor mascot: when the pointer is inside its card it drifts after it */
  function chase(el, r) {
    var host = el.closest(".bridge__canvas") || el.parentElement, h = host.getBoundingClientRect();
    var inside = px > h.left && px < h.right && py > h.top && py < h.bottom;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var tx = inside ? Math.max(-34, Math.min(34, (px - cx) * 0.35)) : 0;
    var ty = inside ? Math.max(-26, Math.min(26, (py - cy) * 0.35)) : 0;
    el.style.setProperty("--cx", tx.toFixed(1) + "px");
    el.style.setProperty("--cy", ty.toFixed(1) + "px");
    if (inside !== el.classList.contains("is-chasing")) { el.classList.toggle("is-chasing", inside); if (inside && !isEmoting(el)) emote(el, "excited"); }
  }

  /* Fast scrolling: everyone in view braces (whoa), leaning against the direction */
  var lastScrollY = global.scrollY, lastScrollT = 0, whoaAt = 0, jellyTimer = 0;
  function onScrollEmote() {
    var now = performance.now(), y = global.scrollY;
    if (lastScrollT) {
      var v = (y - lastScrollY) / Math.max(8, now - lastScrollT);
      var jy = Math.max(-16, Math.min(16, -v * 6));
      mounted.forEach(function (el) { if (onScreen(el)) el.style.setProperty("--jy", jy.toFixed(1) + "px"); });
      clearTimeout(jellyTimer);
      jellyTimer = setTimeout(function () { mounted.forEach(function (el) { el.style.setProperty("--jy", "0px"); }); }, 90);
      if (Math.abs(v) > 1.8 && now - whoaAt > 1800) {
        whoaAt = now;
        var sy = v > 0 ? 1 : -1;
        mounted.forEach(function (el) {
          if (!onScreen(el) || !el.classList.contains("is-in")) return;
          el.style.setProperty("--sy", String(sy));
          emote(el, "whoa");
        });
      }
    }
    lastScrollY = y; lastScrollT = now;
  }

  /* Window and tab: wave on arrival and return, sad when the pointer leaves */
  function wireWindow() {
    if (reduced) return;
    global.addEventListener("scroll", onScrollEmote, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) setTimeout(function () { greet(); }, 300);
    });
    document.documentElement.addEventListener("mouseleave", function () {
      mounted.forEach(function (el) { if (onScreen(el) && el.classList.contains("is-in") && !isEmoting(el)) emote(el, "sad"); });
    });
    document.documentElement.addEventListener("mouseenter", function () {
      mounted.forEach(function (el) { if (onScreen(el) && el.classList.contains("is-in")) emote(el, "happy"); });
    });
    /* theme switch: squint at the light, get cosy in the dark */
    if (global.MutationObserver) new MutationObserver(function () {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      mounted.forEach(function (el) { if (onScreen(el) && el.classList.contains("is-in")) emote(el, dark ? "sleepy" : "squint", dark ? 2200 : 1500); });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
  function greet() {
    mounted.forEach(function (el, i) {
      if (el.classList.contains("m-wrap--cursor") || !onScreen(el) || !el.classList.contains("is-in")) return;
      setTimeout(function () { emote(el, "wave"); }, i * 120);
    });
  }

  /* Hooks into the portfolio page itself (each one is optional) */
  function byName(n) { return mounted.filter(function (el) { return el.getAttribute("data-mascot") === n; })[0]; }
  function on(sel, ev, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), function (x) { x.addEventListener(ev, fn); }); }
  function wireSite() {
    if (reduced) return;
    var orb = byName("orb"), anchor = byName("anchor"), swatch = byName("swatch"), cursor = byName("cursor"), token = byName("token"), nib = byName("nib"), spark = byName("spark"), bridge = byName("bridge");
    if (orb) {
      on("#copyEmail", "click", function () { emote(orb, "proud"); });
      on("#emailLink", "mouseenter", function () { if (!isEmoting(orb)) emote(orb, "curious"); });
      on(".contact__links a", "mouseenter", function () { if (!isEmoting(orb)) emote(orb, "wink"); });
    }
    if (anchor) on("details.case", "toggle", function (e) { if (e.target.open) emote(anchor, "curious"); });
    if (anchor) on(".case__cta", "mouseenter", function () { emote(anchor, "proud"); });
    if (swatch) { on("#deskToggle", "click", function () { emote(swatch, "excited"); }); on(".piece", "click", function () { emote(swatch, "wink"); }); }
    if (cursor) on(".hero .btn", "mouseenter", function () { if (!isEmoting(cursor)) emote(cursor, "excited"); });
    if (cursor) on(".bridge .token", "click", function () { emote(cursor, "happy"); });
    if (token) on(".chips li", "mouseenter", function () { if (!isEmoting(token)) emote(token, "curious"); });
    if (nib) on(".post, .writing a", "mouseenter", function () { if (!isEmoting(nib)) emote(nib, "happy"); });
    if (spark) on(".story__frame", "mouseenter", function () { if (!isEmoting(spark)) emote(spark, "excited"); });
    if (bridge) on(".step", "mouseenter", function () { if (!isEmoting(bridge)) emote(bridge, "curious"); });
  }

  /* ---- Life: small movements that happen on their own ----
     glance: eyes dart somewhere and back while the pointer rests
     stroll: a few hops sideways and back
     signature: one move that belongs to each character */
  var TOKEN_LABELS = ["color/sun-500", "spacing/md", "radius/lg", "type/body", "motion/ease", "color/ink"];
  var DIMS = ["96×96", "120×48", "64×64", "84×84"];
  function pulse(el, cls, ms) { el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); }, ms); }

  function glance(el) {
    var gx = (Math.random() * 2 - 1).toFixed(2), gy = (Math.random() * 1.2 - 0.6).toFixed(2);
    el.style.setProperty("--mx", gx); el.style.setProperty("--my", gy);
    setTimeout(function () { if (performance.now() - lastT > 1200) { el.style.setProperty("--mx", "0"); el.style.setProperty("--my", "0"); } }, 700 + Math.random() * 500);
  }
  function stroll(el) {
    var wx = (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 18);
    el.style.setProperty("--wx", wx.toFixed(0) + "px");
    pulse(el, "is-strolling", 900);
    setTimeout(function () { el.style.setProperty("--wx", "0px"); pulse(el, "is-strolling", 900); }, 2200 + Math.random() * 1200);
  }
  var SIGNATURE = {
    orb: function (el) { pulse(el, "is-roll", 1000); },
    cursor: function (el) { clickBeat(el, 0); },
    anchor: function (el) {
      pulse(el, "is-snap", 1200);
      var t = el.querySelector(".m-dim-text"), old = t.textContent;
      t.textContent = DIMS[Math.floor(Math.random() * 3)];
      setTimeout(function () { t.textContent = old; }, 1400);
    },
    token: function (el) {
      var t = el.querySelector(".m-label"), i = (parseInt(el.getAttribute("data-label") || "0", 10) + 1) % TOKEN_LABELS.length;
      el.setAttribute("data-label", String(i));
      pulse(el, "is-relabel", 600);
      setTimeout(function () { t.textContent = TOKEN_LABELS[i]; }, 300);
    },
    nib: function (el) { pulse(el, "is-redraw", 300); },
    bridge: function (el) { pulse(el, "is-peek", 1400); },
    spark: function (el) { pulse(el, "is-shoot", 1000); },
    swatch: function (el) { pulse(el, "is-shuffle", 800); }
  };
  var lifeTicker = 0;
  function startLife() {
    if (reduced || lifeTicker) return;
    lifeTicker = setInterval(function () {
      if (document.hidden) return;
      mounted.forEach(function (el) {
        if (!el.classList.contains("is-in") || !onScreen(el) || isEmoting(el) || el.classList.contains("is-held") || el.classList.contains("is-strolling")) return;
        var r = Math.random();
        if (r < 0.10) { if (performance.now() - lastT > 1500) glance(el); }
        else if (r < 0.17 && !el.classList.contains("m-wrap--cursor")) stroll(el);
        else if (r < 0.27) { var f = SIGNATURE[el.getAttribute("data-mascot")]; if (f) f(el); }
      });
    }, 1800);
  }

  function reveal(el) {
    if (el.classList.contains("is-in")) return;
    el.classList.add("is-in");
    el.dispatchEvent(new CustomEvent("m:in"));
  }

  function mount(root) {
    var els = Array.prototype.slice.call((root || document).querySelectorAll("[data-mascot]"));
    els.forEach(mountOne);
    startIdle(); startLife();
    if (canTrack) armSleep();
    if (!mount.wired) { mount.wired = true; wireWindow(); wireSite(); setTimeout(greet, 1400); }
    if (reduced || !("IntersectionObserver" in global)) { els.forEach(reveal); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (el) { if (!el.classList.contains("is-in")) io.observe(el); });
  }

  /* Replay an entrance (used by the preview page) */
  function replay(el) {
    el.classList.remove("is-in", "is-click");
    void el.offsetWidth;
    reveal(el);
  }

  function move(el, name) { if (name === "glance") glance(el); else if (name === "stroll") stroll(el); else if (SIGNATURE[el.getAttribute("data-mascot")]) SIGNATURE[el.getAttribute("data-mascot")](el); }
  global.Mascots = { mount: mount, replay: replay, emote: emote, emoteAll: emoteAll, greet: greet, move: move, emotions: Object.keys(EMOTIONS), art: ART };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { mount(); });
  else mount();
})(window);
