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


/* Hero scene: Sunny and Puppy on their spot under the headline (today: the end of the jetty in the Lakeside scene).
   The scene holds a stand-in of each (the mascots' own drawings). The live companion takes its stand-in's place:
   Sunny, or Puppy when the visitor chose Puppy alone (in Together, Sunny stands here and Puppy keeps the corner).
   It flies to its corner once the page is scrolled, and back when the page returns to the top.
   A scene that naps (no data-nap="off") also puts the companion to sleep until the visitor comes close, clicks, types or scrolls. */
(function () {
  "use strict";
  var scene = document.getElementById("heroScene"), slotSun = document.getElementById("heroSun"), slotPup = document.getElementById("heroPup");
  if (!scene || !slotSun || !slotPup) return;
  var SELF = (document.currentScript && document.currentScript.src) || "extras.js";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var A = null, mode = "dock", raf = 0, flight = null, napped = false, uid = 0;

  /* ---- the stand-ins ---- */
  function uniq(svg) { var p = "hn" + (++uid) + "-"; return svg.replace(/id="([\w-]+)"/g, 'id="' + p + '$1"').replace(/url\(#([\w-]+)\)/g, "url(#" + p + "$1)").replace(/href="#([\w-]+)"/g, 'href="#' + p + '$1"'); }
  function needPuppy() {
    if (window.Puppy || document.querySelector("script[data-puppy]")) return;
    var sc = document.createElement("script");
    sc.src = /extras\.js/.test(SELF) ? SELF.replace(/extras\.js/, "puppy.js") : "puppy.js";
    sc.async = true; sc.setAttribute("data-puppy", "");
    document.head.appendChild(sc);
  }
  /* a scene may opt out of the nap (data-nap="off"): its stand-ins are awake and the live companion is not put to sleep */
  var NAPS = scene.getAttribute("data-nap") !== "off", POSE = NAPS ? ' data-act="sleep"' : "";
  var SPOT = scene.getAttribute("data-spot") || "grass"; /* what the companion lands on, for its landing line */
  function draw() {
    var S = window.Sunny, P = window.Puppy, done = true;
    if (!slotSun.firstChild) {
      if (S && typeof S.art === "function") slotSun.innerHTML = '<div class="sunny is-in hero__nap"' + POSE + '><div class="sunny__char">' + uniq(S.art()) + "</div></div>";
      else done = false;
    }
    if (!slotPup.firstChild) {
      if (P && typeof P.art === "function") slotPup.innerHTML = '<div class="puppy is-in hero__nap"' + POSE + '><div class="puppy__char">' + uniq(P.art()) + "</div></div>";
      else { done = false; if (S) needPuppy(); }
    }
    return done;
  }
  var drawTries = 0;
  (function waitArt() { if (draw()) return; if (++drawTries < 100) setTimeout(waitArt, 150); })();

  /* ---- the live companion ---- */
  function companion() { return window.Sunny && window.Sunny.mode ? window.Sunny.mode() : "sunny"; }
  function away() { return document.body.classList.contains("recruiter"); } /* recruiter view hides the companions: the scene keeps its stand-ins */
  function pick() {
    if (away()) return null;
    if (companion() === "puppy") {
      var p = document.querySelector("body > .puppy");
      if (!p || p.classList.contains("is-off")) return null;
      return { root: p, chr: p.querySelector(".puppy__char"), kind: "puppy", perch: "puppy--perch", landing: "puppy--landing", slot: slotPup };
    }
    var s = document.querySelector("body > .sunny");
    if (!s || !s.querySelector(".sunny__char")) return null;
    return { root: s, chr: s.querySelector(".sunny__char"), kind: "sunny", perch: "sunny--perch", landing: "sunny--landing", slot: slotSun };
  }
  function sunnyRoot() { return document.querySelector("body > .sunny"); }
  /* which stand-ins step aside: the one the live companion replaces, and the pup's when the real pup is on the page */
  function mark() {
    var s = sunnyRoot(), c = companion();
    if (s) s.classList.toggle("is-pup-perched", !!A && A.kind === "puppy" && mode === "hero");
    scene.classList.toggle("live-sun", !!A && A.kind === "sunny");
    scene.classList.toggle("live-pup", !!A && (A.kind === "puppy" || c === "together"));
    scene.classList.toggle("is-home", !!A && mode === "hero"); /* the live companion is on its spot right now */
  }
  /* the spot is free when the page is at its top and the spot itself is on screen (the scene's last few pixels may sit below the fold) */
  function fits() { var r = (A ? A.slot : scene).getBoundingClientRect(); return r.top > 80 && r.bottom <= window.innerHeight + 4; }
  function place() {
    if (!A || mode !== "hero") return;
    var r = A.slot.getBoundingClientRect(), root = A.root;
    root.style.left = Math.round(r.right + window.scrollX - root.offsetWidth) + "px";
    root.style.top = Math.round(r.bottom + window.scrollY - root.offsetHeight) + "px";
    root.style.right = "auto"; root.style.bottom = "auto";
  }
  function clearPos(root) { root.style.left = root.style.top = root.style.right = root.style.bottom = ""; }
  /* let go of the current companion without a flight (the visitor switched companions) */
  function release() {
    if (!A) return;
    if (flight) { try { flight.cancel(); } catch (e) { /* ignore */ } flight = null; }
    A.root.classList.remove(A.perch, A.landing, "is-flying");
    if (A.kind === "sunny") A.root.classList.remove("is-flip");
    else if (mode === "hero") A.root.classList.add("is-flip");
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
    else { root.classList.remove(A.perch); clearPos(root); }
    if (kind === "puppy" && next === "hero") root.classList.remove("is-flip"); /* on the grass the pup faces Sunny */
    var to = chr.getBoundingClientRect();
    if (reduced) { root.classList.remove(A.landing); if (kind === "puppy" && next === "dock") root.classList.add("is-flip"); return; } /* no flight: just be there */
    var dx = from.left - to.left, dy = from.top - to.top;
    /* Superman: crouch, launch, a curved flight facing the direction of travel, level off, touch down, dust */
    var S = window.Sunny, P = window.Puppy, going = next === "dock", left = dx > 0; /* dx is old minus new: positive means we travel left */
    root.classList.add("is-flying"); root.classList.toggle("is-flip", left);
    if (S) { S.emote("cool", 2200); if (S.sounds && S.sounds.indexOf("swoosh") > -1) S.sfx("swoosh"); }
    var land = function () {
      flight = null;
      root.classList.remove(A ? A.landing : "sunny--landing", "is-flying");
      if (kind === "puppy") root.classList.toggle("is-flip", going); /* in the corner the pup faces the page; on the grass it faces Sunny */
      else root.classList.remove("is-flip");
      dust();
      if (kind === "puppy" && P && P.pant) P.pant(2400);
      if (S) {
        if (S.sounds && S.sounds.indexOf("land") > -1) S.sfx("land");
        if (going) { S.emote("proud", 1800); S.say(kind === "puppy" ? "Up, up and… paws down." : "Up, up and… down here.", 2600); }
        else { S.emote("relaxed", 1800); S.say("Back on the " + SPOT + (kind === "puppy" ? "." : ". Comfy."), 2000); }
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
    if (away()) { release(); return; }
    if (!A) { if (!attach()) return; }
    var y = window.scrollY || 0;
    if (mode === "hero" && (y > 140 || !fits())) setMode("dock");
    else if (mode === "dock" && y < 40 && fits()) setMode("hero");
    place();
  }
  function schedule() { if (!raf) raf = setTimeout(tick, 16); }
  /* the first nap: once, as the page opens. After that the companion sleeps on its own clock like anywhere else. */
  function nap() {
    if (!NAPS || napped || reduced || !A || mode !== "hero") return;
    var S = window.Sunny;
    if (S && S.nap && S.nap()) napped = true;
  }
  /* start (or restart, after a companion switch) on the page as it is: no flight, just be where we belong */
  function attach() {
    var n = pick();
    if (!n) { mark(); return false; }
    if (A && A.root === n.root) return true;
    release(); A = n; mode = "dock";
    if ((window.scrollY || 0) < 40 && fits()) {
      A.root.classList.add(A.perch); mode = "hero"; place();
      if (A.kind === "puppy") A.root.classList.remove("is-flip");
      nap();
    }
    mark();
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
    window.addEventListener("load", schedule); /* fonts and images settle the layout: sit on the final spot */
    scene.addEventListener("transitionend", schedule); /* and so does the scene's own entrance */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    /* Puppy alone naps through Sunny's engine, whose own "came close" test watches Sunny: wake the pup when the pointer nears it */
    window.addEventListener("pointermove", function (e) {
      if (!A || A.kind !== "puppy" || mode !== "hero" || !window.Sunny) return;
      var s = window.Sunny.sense && window.Sunny.sense(); if (!s || !s.asleep) return;
      var r = A.chr.getBoundingClientRect();
      if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < r.width * 1.3) window.Sunny.wake();
    }, { passive: true });
    /* a different companion chosen in the preferences, or the recruiter view switched: hand the spot over */
    if (window.Sunny && window.Sunny.on) window.Sunny.on("mode", function () { release(); retry(40); });
    if (window.MutationObserver) new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return true;
  }
  var tries = 0;
  (function wait() { if (hook()) return; if (++tries < 80) setTimeout(wait, 150); })();
})();
