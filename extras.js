/* Extras: the prompt-to-component replay and the before/after compare slider. Plain JS, no services. */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");

  /* ============================================================
     Prompt to component: a looping replay of the real workflow
     ============================================================ */
  var replay = $("#replay");
  if (replay) {
    var typed = $("#replayTyped", replay), frame = $("#replayFrame", replay), code = $("#replayCode", replay), status = $("#replayStatus", replay), restart = $("#replayRestart", replay);
    var PROMPT = "Build a Confirm dialog from the system: title, body, ghost + primary buttons. Use radius/md and space/4.";
    var CODE = [
      '<Dialog size="md">',
      '  <Dialog.Title>Delete project?</Dialog.Title>',
      '  <Dialog.Body>This can’t be undone.</Dialog.Body>',
      '  <Dialog.Actions>',
      '    <Button variant="ghost">Cancel</Button>',
      '    <Button variant="primary">Delete</Button>',
      '  </Dialog.Actions>',
      '</Dialog>'
    ];
    var parts = $$(".rf", frame), timers = [], running = false, playing = false, loopTimer = 0;
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearAll() { timers.forEach(clearTimeout); timers = []; clearTimeout(loopTimer); }
    function reset() {
      clearAll();
      typed.textContent = ""; code.textContent = "";
      parts.forEach(function (p) { p.classList.remove("is-on"); });
      replay.classList.remove("is-synced", "is-building", "is-coding");
      status.textContent = "waiting for a prompt";
    }
    function run() {
      reset(); running = true;
      if (reduced) {
        typed.textContent = PROMPT; parts.forEach(function (p) { p.classList.add("is-on"); });
        code.textContent = CODE.join("\n"); replay.classList.add("is-synced"); status.textContent = "● synced · 0 drift";
        return;
      }
      var i = 0;
      (function type() {
        if (i <= PROMPT.length) { typed.textContent = PROMPT.slice(0, i++); later(type, 22 + Math.random() * 30); return; }
        status.textContent = "figma mcp · reading tokens…";
        later(build, 500);
      })();
      function build() {
        replay.classList.add("is-building");
        parts.forEach(function (p, n) { later(function () { p.classList.add("is-on"); }, 160 + n * 260); });
        later(function () { status.textContent = "code connect · mapping…"; replay.classList.add("is-coding"); writeCode(); }, 300 + parts.length * 260);
      }
      function writeCode() {
        var line = 0;
        (function next() {
          if (line < CODE.length) { code.textContent += (line ? "\n" : "") + CODE[line++]; later(next, 190); return; }
          later(function () { replay.classList.add("is-synced"); status.textContent = "● synced · 0 drift"; }, 350);
          loopTimer = setTimeout(run, 6500);
        })();
      }
    }
    function start() { if (!playing) { playing = true; run(); } }
    function stop() { playing = false; running = false; clearAll(); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
      }, { threshold: 0.35 }).observe(replay);
    } else start();
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (!reduced) start(); });
    if (restart) restart.addEventListener("click", function () { playing = true; run(); });
  }

  /* sound profile switcher */
  var voiceBox = $("#sunnyVoice");
  if (voiceBox) {
    var voiceBtns = $$("[data-voice]", voiceBox);
    function markVoice() {
      var S = window.Sunny, cur = S ? (S.soundOn() ? S.voice() : "off") : "soft";
      voiceBtns.forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-voice") === cur); });
    }
    voiceBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var S = window.Sunny; if (!S) return;
        var v = b.getAttribute("data-voice");
        if (v === "off") { S.setSound(false); S.say("Quiet mode. Still here.", 2000); }
        else { S.setVoice(v, true); S.emote("happy", 1400); }
        markVoice();
      });
    });
    var tries = 0, tv = setInterval(function () { if (window.Sunny && window.Sunny.voice) { markVoice(); clearInterval(tv); } else if (++tries > 50) clearInterval(tv); }, 100);
    window.addEventListener("prefs:change", markVoice);
  }

  /* gallery: nine pieces first */
  var galleryAll = $("#galleryAll");
  if (galleryAll) $$("#gallery .piece").forEach(function (el, i) { if (i >= 10) el.classList.add("is-more"); });
  if (galleryAll) galleryAll.addEventListener("click", function () {
    var g = $("#gallery"); g.classList.add("show-all"); galleryAll.setAttribute("aria-expanded", "true");
    $$(".piece", g).forEach(function (el) { el.classList.add("is-in"); });
    window.dispatchEvent(new Event("resize"));
  });

  /* "Ask Sunny" buttons on the page open the chat, with a question if given */
  $$("[data-ask]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var api = window.SunnyAsk; if (!api) return;
      var q = btn.getAttribute("data-ask");
      if (q) api.ask(q); else api.open();
    });
  });

  /* prompt cards: copy the prompt text */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".prompt"), text = card ? $(".prompt__body", card).textContent : "";
      var done = function () { btn.textContent = "copied"; btn.classList.add("is-done"); setTimeout(function () { btn.textContent = "copy"; btn.classList.remove("is-done"); }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    });
  });

  /* ============================================================
     Compare slider: drag between two images
     ============================================================ */
  $$("[data-compare]").forEach(function (fig) {
    var stage = $(".compare__stage", fig), range = $(".compare__range", fig);
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


/* How I work: four steps, one stage. Auto-plays, pauses on hover or focus, arrow keys move between steps. */
(function () {
  "use strict";
  var how = document.getElementById("how"); if (!how) return;
  var tabs = Array.prototype.slice.call(how.querySelectorAll(".how__step"));
  var panels = Array.prototype.slice.call(how.querySelectorAll(".how__panel"));
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var idx = 0, timer = 0, paused = false, inView = false, manual = false;
  tabs.forEach(function (t) { t.style.setProperty("--dur", (parseInt(t.getAttribute("data-dur"), 10) || 5200) + "ms"); });

  function show(i, user) {
    idx = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, n) {
      var on = n === idx;
      t.classList.toggle("is-active", on);
      var card = t.closest(".how__card"); if (card) card.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var bar = t.querySelector(".how__bar i");
      if (bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
    });
    panels.forEach(function (p, n) { if (n === idx) p.removeAttribute("hidden"); else p.setAttribute("hidden", ""); });
    how.setAttribute("data-step", String(idx));
    /* the Build step hosts the replay; start it directly rather than waiting on its own visibility check */
    var restart = panels[idx] && panels[idx].querySelector("#replayRestart");
    if (restart) setTimeout(function () { restart.click(); }, 60);
    if (user) { manual = true; how.classList.add("is-manual"); document.dispatchEvent(new CustomEvent("how:step", { detail: idx })); }
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduced || paused || manual || !inView) return;
    var dur = parseInt(tabs[idx].getAttribute("data-dur"), 10) || 5200;
    timer = setTimeout(function () { show(idx + 1); }, dur);
  }
  function pause() { paused = true; how.classList.add("is-paused"); clearTimeout(timer); }
  function resume() { paused = false; how.classList.remove("is-paused"); schedule(); }

  tabs.forEach(function (t, n) {
    t.addEventListener("click", function () { show(n, true); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, go = null;
      if (k === "ArrowRight" || k === "ArrowDown") go = idx + 1;
      else if (k === "ArrowLeft" || k === "ArrowUp") go = idx - 1;
      else if (k === "Home") go = 0;
      else if (k === "End") go = tabs.length - 1;
      if (go === null) return;
      e.preventDefault(); show(go, true); tabs[idx].focus();
    });
  });
  /* the whole card is the target, not just its heading; the Build panel keeps its own replay button */
  Array.prototype.forEach.call(how.querySelectorAll(".how__card"), function (card, n) {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".how__step, a, button")) return;
      show(n, true); tabs[n].focus({ preventScroll: true });
    });
  });
  Array.prototype.forEach.call(how.querySelectorAll("[data-go]"), function (b) {
    b.addEventListener("click", function () { show(parseInt(b.getAttribute("data-go"), 10) || 0, true); });
  });
  how.addEventListener("mouseenter", pause);
  how.addEventListener("mouseleave", resume);
  how.addEventListener("focusin", pause);
  how.addEventListener("focusout", function (e) { if (!how.contains(e.relatedTarget)) resume(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { inView = en.isIntersecting; if (inView) schedule(); else clearTimeout(timer); });
    }, { threshold: 0.3 }).observe(how);
  } else { inView = true; schedule(); }
  document.addEventListener("visibilitychange", function () { if (document.hidden) clearTimeout(timer); else schedule(); });
  show(0);
})();


/* Hero 18: the companion peeks from behind the bridge card, ducks when you hover it, and flies to its corner once you scroll.
   The companion is Sunny, or Puppy when the visitor chose Puppy alone (in Together, Sunny perches and Puppy keeps the corner). */
(function () {
  "use strict";
  var card = document.getElementById("heroCard"), bridge = document.getElementById("bridge");
  if (!card || !bridge) return;
  var wide = window.matchMedia("(min-width: 1081px)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  if (reduced) return;
  var A = null, mode = "dock", raf = 0, greeted = false, flight = null;

  function companion() { return window.Sunny && window.Sunny.mode ? window.Sunny.mode() : "sunny"; }
  /* who perches: Sunny, or Puppy when it is alone */
  function pick() {
    if (companion() === "puppy") {
      var p = document.querySelector("body > .puppy");
      if (!p || p.classList.contains("is-off")) return null;
      return { root: p, chr: p.querySelector(".puppy__char"), kind: "puppy", perch: "puppy--perch", landing: "puppy--landing" };
    }
    var s = document.querySelector("body > .sunny");
    if (!s || !s.querySelector(".sunny__char")) return null;
    return { root: s, chr: s.querySelector(".sunny__char"), kind: "sunny", perch: "sunny--perch", landing: "sunny--landing" };
  }
  function sunnyRoot() { return document.querySelector("body > .sunny"); }
  /* Puppy on the perch: Sunny's corner (and its Ask tag) steps aside */
  function mark() { var s = sunnyRoot(); if (s) s.classList.toggle("is-pup-perched", !!A && A.kind === "puppy" && mode === "hero"); }
  function place() {
    if (!A || mode !== "hero") return;
    var r = bridge.getBoundingClientRect(), root = A.root, chr = A.chr;
    var size = chr.offsetWidth || 150;
    var cx = r.right - size - 36;                          /* character box left */
    var cy = r.top - size * (A.kind === "puppy" ? 0.74 : 0.78); /* chin on the card's top edge, eyes clear above it */
    root.style.left = Math.round(cx + size - root.offsetWidth) + "px";
    root.style.top = Math.round(cy + size - root.offsetHeight) + "px";
    root.style.right = "auto"; root.style.bottom = "auto";
  }
  function clearPos(root) { root.style.left = root.style.top = root.style.right = root.style.bottom = ""; }
  /* let go of the current companion without a flight (the visitor switched companions) */
  function release() {
    if (!A) return;
    if (flight) { try { flight.cancel(); } catch (e) { /* ignore */ } flight = null; }
    A.root.classList.remove(A.perch, A.landing, "is-duck", "is-flying");
    if (A.kind === "sunny") A.root.classList.remove("is-flip");
    clearPos(A.root);
    A = null; mode = "dock"; mark();
  }
  function setMode(next) {
    if (!A || next === mode) return;
    var root = A.root, chr = A.chr, kind = A.kind;
    var from = chr.getBoundingClientRect();
    mode = next; mark();
    root.classList.add(A.landing);
    if (next === "hero") { root.classList.add(A.perch); place(); }
    else { root.classList.remove(A.perch, "is-duck"); clearPos(root); }
    var to = chr.getBoundingClientRect();
    var dx = from.left - to.left, dy = from.top - to.top;
    /* Superman: crouch, launch, a curved flight facing the direction of travel, level off, touch down, dust */
    var S = window.Sunny, P = window.Puppy, going = next === "dock", left = dx > 0; /* dx is old minus new: positive means we travel left */
    root.classList.add("is-flying"); root.classList.toggle("is-flip", left);
    if (S) { S.emote("cool", 2200); if (S.sounds && S.sounds.indexOf("swoosh") > -1) S.sfx("swoosh"); }
    var land = function () {
      flight = null;
      root.classList.remove(A ? A.landing : "sunny--landing", "is-flying");
      if (kind === "puppy") root.classList.add("is-flip"); /* alone, the pup faces the page */
      else root.classList.remove("is-flip");
      dust();
      if (kind === "puppy" && P && P.pant) P.pant(2400);
      if (S) {
        if (S.sounds && S.sounds.indexOf("land") > -1) S.sfx("land");
        if (going) { S.emote("proud", 1800); S.say(kind === "puppy" ? "Up, up and… paws down." : "Up, up and… down here.", 2600); }
        else { S.emote("curious", 1500); S.say("Back on my perch.", 2000); }
      }
    };
    function dust() {
      var d = document.createElement("span"); d.className = "sunny__dust"; d.innerHTML = "<i></i><i></i><i></i><i></i>";
      chr.appendChild(d); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 700);
    }
    /* the path: start at the old spot (dx, dy away from the new one), rise, cruise, settle at 0,0 */
    var sx = dx, sy = dy, lift = going ? 260 : 200;
    var p0 = [sx, sy], p1 = [sx + (0 - sx) * 0.12, sy - lift], p2 = [(0 - sx) * -0.3, -lift * 0.75], p3 = [0, 0];
    function bez(t, a, b2, c, d) { var m = 1 - t; return m * m * m * a + 3 * m * m * t * b2 + 3 * m * t * t * c + t * t * t * d; }
    function lerp(a, b2, t) { return a + (b2 - a) * t; }
    /* Sunny tips into a horizontal cruise; the pup flies nose first, body level, so its lean is smaller */
    var back = kind === "puppy" ? -10 : -22, cruise = kind === "puppy" ? 22 : 78, settle = kind === "puppy" ? 6 : 14;
    function pose(t) { /* lean back on take-off, tip into the cruise, level off for landing */
      var dir = left ? -1 : 1; /* face the way we go */
      var r = t < 0.14 ? lerp(0, back, t / 0.14) : t < 0.55 ? lerp(back, cruise, (t - 0.14) / 0.41) : t < 0.88 ? lerp(cruise, settle, (t - 0.55) / 0.33) : lerp(settle, 0, (t - 0.88) / 0.12);
      return r * dir;
    }
    var frames = [{ transform: "translate(" + sx + "px," + sy + "px) scale(1.06, 0.92)", offset: 0 }];
    var N = 36;
    for (var i = 1; i <= N; i++) {
      var t = i / N, x = bez(t, p0[0], p1[0], p2[0], p3[0]), y = bez(t, p0[1], p1[1], p2[1], p3[1]);
      var sc = 1 + Math.sin(t * Math.PI) * 0.1;
      frames.push({ transform: "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + pose(t).toFixed(1) + "deg) scale(" + sc.toFixed(3) + ")", offset: 0.06 + t * 0.86 });
    }
    frames.push({ transform: "translateY(7px) scale(1.1, 0.88)", offset: 0.95 }, { transform: "translateY(-3px) scale(0.98, 1.03)", offset: 0.985 }, { transform: "none", offset: 1 });
    try {
      flight = chr.animate(frames, { duration: going ? 1700 : 1500, easing: "cubic-bezier(0.42, 0.02, 0.2, 1)" });
      flight.onfinish = land;
    } catch (e) { land(); }
  }
  function tick() {
    raf = 0;
    if (!A) return;
    if (!wide.matches) { setMode("dock"); return; }
    var top = bridge.getBoundingClientRect().top;
    if (mode === "hero" && top < 120) setMode("dock");
    else if (mode === "dock" && top > 180) setMode("hero");
    place();
  }
  function schedule() { if (!raf) raf = setTimeout(tick, 16); }
  /* start (or restart, after a companion switch) on the page as it is: no flight, just sit where we belong */
  function attach() {
    var n = pick();
    if (!n) return false;
    if (A && A.root === n.root) return true;
    release(); A = n; mode = "dock";
    if (wide.matches && bridge.getBoundingClientRect().top > 180) {
      A.root.classList.add(A.perch); mode = "hero"; place(); mark();
      if (A.kind === "puppy") A.root.classList.add("is-flip");
      if (!greeted) setTimeout(function () { if (mode === "hero" && window.Sunny && !greeted) { greeted = true; window.Sunny.emote("curious"); window.Sunny.say("Boo. Hover the card, it tilts.", 3000); } }, 1400);
    }
    return true;
  }
  function retry(n) { if (attach()) return; if (n > 0) setTimeout(function () { retry(n - 1); }, 150); }
  var hooked = false;
  function hook() {
    if (!attach()) return false;
    if (hooked) return true;
    hooked = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    bridge.addEventListener("mouseenter", function () { if (A && mode === "hero") { A.root.classList.add("is-duck"); if (window.Sunny) window.Sunny.emote("shy", 1600); } });
    bridge.addEventListener("mouseleave", function () { if (A) A.root.classList.remove("is-duck"); });
    /* a different companion chosen in the preferences: hand the perch over */
    if (window.Sunny && window.Sunny.on) window.Sunny.on("mode", function () { release(); retry(40); });
    return true;
  }
  var tries = 0;
  (function wait() { if (hook()) return; if (++tries < 80) setTimeout(wait, 150); })();
})();
