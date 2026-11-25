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


/* Process (Bento): the tiles' drawings play one after another, one 4 s loop each, while the section is on screen.
   Hovering or tapping a tile plays it next and tells Sunny which step it is. Nothing moves with reduced motion. */
(function () {
  "use strict";
  var box = document.getElementById("pbento"); if (!box) return;
  var tiles = Array.prototype.slice.call(box.querySelectorAll(".pbento__tile"));
  var LOOP = 4000, cur = 0, timer = 0, seen = false;
  function still() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion"); }
  function play(n) {
    clearTimeout(timer);
    cur = (n + tiles.length) % tiles.length;
    tiles.forEach(function (t, i) { t.classList.remove("is-play"); });
    void box.offsetWidth; /* restart the loop from its first frame */
    tiles[cur].classList.add("is-play");
    timer = setTimeout(function () { play(cur + 1); }, LOOP);
  }
  function stop() { clearTimeout(timer); tiles.forEach(function (t) { t.classList.remove("is-play"); }); }
  function set() {
    var on = seen && !still() && !document.hidden;
    box.classList.toggle("is-on", on);
    if (on) { if (!box.querySelector(".is-play")) play(cur); } else stop();
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { entries.forEach(function (en) { seen = en.isIntersecting; set(); }); }, { threshold: 0.15 }).observe(box);
  } else { seen = true; set(); }
  document.addEventListener("visibilitychange", set);
  tiles.forEach(function (t, n) {
    function pick() {
      document.dispatchEvent(new CustomEvent("how:step", { detail: n }));
      if (box.classList.contains("is-on") && n !== cur) play(n);
    }
    t.addEventListener("pointerenter", pick); t.addEventListener("click", pick);
  });
})();


/* Hero scene: Sunny and Puppy on their spot under the headline (today: the end of the jetty in the Lakeside scene).
   The scene holds a stand-in of each (the mascots' own drawings). The live companion takes its stand-in's place:
   Sunny, or Puppy when the visitor chose Puppy alone; in Together both stand on it, Sunny on its spot and Puppy on its own beside it.
   It flies to its corner once the page is scrolled, and back when the page returns to the top.
   A scene that naps (no data-nap="off") also puts the companion to sleep until the visitor comes close, clicks, types or scrolls. */
(function () {
  "use strict";
  var scene = document.getElementById("heroScene"), slotSun = document.getElementById("heroSun"), slotPup = document.getElementById("heroPup");
  if (!scene || !slotSun || !slotPup) return;
  var SELF = (document.currentScript && document.currentScript.src) || "extras.js";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var A = null, B = null, mode = "dock", raf = 0, napped = false, uid = 0; /* A: the companion on its spot; B: Puppy beside Sunny, in Together */

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
  function pickPup() { /* Together: the real pup takes its own stand-in's place beside Sunny */
    if (away() || companion() !== "together") return null;
    var p = document.querySelector("body > .puppy");
    if (!p || p.classList.contains("is-off") || !p.querySelector(".puppy__char")) return null;
    return { root: p, chr: p.querySelector(".puppy__char"), kind: "puppy", perch: "puppy--perch", landing: "puppy--landing", slot: slotPup, second: true };
  }
  function all() { return A ? (B ? [A, B] : [A]) : []; }
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
  function placeOne(e) {
    var r = e.slot.getBoundingClientRect(), root = e.root;
    root.style.left = Math.round(r.right + window.scrollX - root.offsetWidth) + "px";
    root.style.top = Math.round(r.bottom + window.scrollY - root.offsetHeight) + "px";
    root.style.right = "auto"; root.style.bottom = "auto";
  }
  function place() { if (!A || mode !== "hero") return; all().forEach(placeOne); }
  function clearPos(root) { root.style.left = root.style.top = root.style.right = root.style.bottom = ""; }
  /* let go of the current companion without a flight (the visitor switched companions) */
  function releaseOne(e) {
    if (e.flight) { try { e.flight.cancel(); } catch (x) { /* ignore */ } e.flight = null; }
    e.root.classList.remove(e.perch, e.landing, "is-flying");
    if (e.kind === "sunny") e.root.classList.remove("is-flip");
    else if (mode === "hero") e.root.classList.add("is-flip");
    clearPos(e.root);
  }
  function release() {
    if (!A) return;
    all().forEach(releaseOne);
    A = null; B = null; mode = "dock"; mark();
  }
  function setMode(next) {
    if (!A || next === mode) return;
    var list = all(), froms = list.map(function (e) { return e.chr.getBoundingClientRect(); });
    mode = next; mark();
    list.forEach(function (e, i) { fly(e, next, froms[i], i); });
  }
  function fly(E, next, from, order) {
    var root = E.root, chr = E.chr, kind = E.kind, lead = order === 0; /* the first one talks; the second follows a beat later */
    root.classList.add(E.landing);
    if (next === "hero") { root.classList.add(E.perch); placeOne(E); }
    else { root.classList.remove(E.perch); clearPos(root); }
    if (kind === "puppy" && next === "hero") root.classList.remove("is-flip"); /* on the grass the pup faces Sunny */
    var to = chr.getBoundingClientRect();
    if (reduced) { root.classList.remove(E.landing); if (kind === "puppy" && next === "dock") root.classList.add("is-flip"); return; } /* no flight: just be there */
    var dx = from.left - to.left, dy = from.top - to.top;
    /* Superman: crouch, launch, a curved flight facing the direction of travel, level off, touch down, dust */
    var S = window.Sunny, P = window.Puppy, going = next === "dock", left = dx > 0; /* dx is old minus new: positive means we travel left */
    root.classList.add("is-flying"); root.classList.toggle("is-flip", left);
    if (S && lead) { S.emote("cool", 2200); if (S.sounds && S.sounds.indexOf("swoosh") > -1) S.sfx("swoosh"); }
    var land = function () {
      E.flight = null;
      root.classList.remove(E.landing, "is-flying");
      if (kind === "puppy") root.classList.toggle("is-flip", going); /* in the corner the pup faces the page; on the grass it faces Sunny */
      else root.classList.remove("is-flip");
      dust();
      if (kind === "puppy" && P && P.pant) P.pant(2400);
      if (S && lead) {
        if (S.sounds && S.sounds.indexOf("land") > -1) S.sfx("land");
        if (going) { S.emote("proud", 1800); S.say(kind === "puppy" ? "Up, up and… paws down." : "Up, up and… down here.", 2600); }
        else { S.emote("relaxed", 1800); S.say("Back on the " + SPOT + (kind === "puppy" ? "." : B ? ", both of us." : ". Comfy."), 2000); }
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
      E.flight = chr.animate(frames, { duration: going ? 1700 : 1500, delay: lead ? 0 : 140, easing: "cubic-bezier(0.42, 0.02, 0.2, 1)", fill: lead ? "auto" : "backwards" });
      E.flight.onfinish = land;
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
  function seat(e) { e.root.classList.add(e.perch); placeOne(e); if (e.kind === "puppy") e.root.classList.remove("is-flip"); }
  function attachPup() { /* Together: seat the pup once it is on the page (puppy.js loads on demand) */
    if (!A || A.kind !== "sunny") { B = null; return true; }
    if (companion() !== "together") { if (B) { releaseOne(B); B = null; } return true; }
    if (B) return true;
    var p = pickPup(); if (!p) return false;
    B = p; if (mode === "hero") seat(B); mark();
    return true;
  }
  function attach() {
    var n = pick();
    if (!n) { mark(); return false; }
    if (A && A.root === n.root) { attachPup(); return true; }
    release(); A = n; mode = "dock";
    if ((window.scrollY || 0) < 40 && fits()) {
      seat(A); mode = "hero";
      nap();
    }
    attachPup();
    mark();
    return true;
  }
  function retry(n) { if (attach() && attachPup()) return; if (n > 0) setTimeout(function () { retry(n - 1); }, 150); }
  var hooked = false;
  function hook() {
    if (!attach()) return false;
    if (hooked) return true;
    hooked = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule); /* fonts and images settle the layout: sit on the final spot */
    scene.addEventListener("transitionend", schedule); /* and so does the scene's own entrance */
    /* the scene's own motion (water, birds, reeds) rests while the scene is out of sight */
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { scene.classList.toggle("is-still", !es[es.length - 1].isIntersecting); }).observe(scene);
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


/* The closing lake behind the contact area: a copy of the hero's drawing (hills, water, boat, birds, stars, reeds) without the jetty,
   so the art lives in one place. It rests while it is out of sight, like the hero's. */
(function () {
  "use strict";
  var foot = document.getElementById("lakeFoot"), art = document.querySelector("#heroScene .lk-art");
  if (!foot || !art) return;
  var copy = art.cloneNode(true);
  Array.prototype.forEach.call(copy.querySelectorAll("defs, .lk-post, .lk-dock, .lk-seam, .lk-edge"), function (n) { n.parentNode.removeChild(n); });
  foot.appendChild(copy);
  Array.prototype.forEach.call(document.querySelectorAll("#heroScene .lk-reeds"), function (r) { foot.appendChild(r.cloneNode(true)); });
  foot.classList.add("is-still");
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { foot.classList.toggle("is-still", !es[es.length - 1].isIntersecting); }).observe(foot);
  else foot.classList.remove("is-still");
})();


/* The hero lake wears the visitor's weather. The loading film reads the real weather once and keeps it in this browser
   ("sunny:wx", the same reading, never a new request or a location prompt); the lake uses that reading through the film's
   own table (SunnyWeather), so the two always agree. No reading (never loaded, location never found, older than 3 hours):
   the plain sunrise, and nothing is claimed. Only the weather changes the scene; day and night stay with the theme switch.
   For checking: ?weather=clear|partly|cloudy|drizzle|rain|heavy|storm|hail|snow|blizzard|fog|wind, as for the film. */
(function () {
  "use strict";
  var scene = document.getElementById("heroScene"), line = document.getElementById("heroWx");
  if (!scene || !scene.classList.contains("hero__scene--lake")) return;
  var MAX_AGE = 3 * 3600000, F = /^en-(US|LR)\b|^my\b/i.test(navigator.language || "");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  function cached() {
    try { var c = JSON.parse(localStorage.getItem("sunny:wx") || "null"); if (c && c.v === 2 && c.rec && Date.now() - c.t < MAX_AGE) return c.rec; } catch (e) { /* ignore */ }
    return null;
  }
  /* one name for the scene, in the film's order: storm, snow, rain, fog, wind, then how cloudy */
  function kindOf(cl) {
    if (!cl || !cl.known) return null;
    if (cl.kind === "storm" || cl.kind === "snow" || cl.kind === "fog" || cl.kind === "wind") return cl.kind;
    if (cl.kind === "rain") return cl.sub === "drizzle" ? "drizzle" : cl.sub === "heavy" ? "heavy" : "rain";
    return cl.sub === "overcast" || cl.cloud >= 0.7 ? "cloudy" : cl.sub === "partly" ? "partly" : "clear";
  }
  var SAID = { clear: "Clear skies", partly: "Partly cloudy", cloudy: "Cloudy", drizzle: "Drizzle", rain: "Rain", heavy: "Heavy rain", storm: "Thunderstorm", snow: "Snow", fog: "Fog", wind: "Windy" };
  function said(cl, k) {
    if (k === "storm" && cl.sub === "hail") return "Hailstorm";
    if (k === "snow" && cl.sub === "blizzard") return "Blizzard";
    if (k === "clear" && cl.heat) return "Hot and clear";
    if (k === "clear" && cl.frost) return "Clear and frosty";
    return SAID[k];
  }
  /* ---- the layers: drawn once, only for the weather there is ---- */
  /* clouds: three cumulus shapes built from overlapping puffs on a flat base, shaded light on top and darker underneath
     (the colours come from the weather, so the same cloud is white on a bright day and slate in a storm), with a soft
     highlight on the sunny side. Each one gets its own ids so the shading never leaks between them. */
  var PUFFS = [
    { c: [[55, 60, 25], [88, 44, 33], [127, 49, 29], [158, 62, 20]], base: [30, 58, 146, 22] },
    { c: [[38, 64, 19], [70, 50, 27], [106, 41, 32], [141, 50, 26], [170, 64, 16]], base: [24, 60, 160, 20] },
    { c: [[70, 56, 24], [101, 36, 35], [134, 54, 25]], base: [48, 58, 110, 22] }
  ];
  var cuid = 0;
  function cloud(v) {
    var P = PUFFS[v % PUFFS.length], id = "wxc" + (++cuid), shapes = "", hi = "";
    P.c.forEach(function (c) { shapes += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; });
    var top = P.c.reduce(function (m, c) { return c[1] - c[2] < m[1] - m[2] ? c : m; }); /* one soft light across the crown, not a shine on every puff */
    hi = '<ellipse cx="' + (top[0] - 8) + '" cy="' + (top[1] - top[2] * 0.35) + '" rx="' + (top[2] * 1.9) + '" ry="' + (top[2] * 0.6) + '"/>';
    shapes += '<rect x="' + P.base[0] + '" y="' + P.base[1] + '" width="' + P.base[2] + '" height="' + P.base[3] + '" rx="11"/>';
    return '<svg viewBox="0 0 200 84" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + 'g" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="80"><stop class="c-s1" offset="0"/><stop class="c-s2" offset="0.55"/><stop class="c-s3" offset="1"/></linearGradient>' +
      '<clipPath id="' + id + 'k">' + shapes + "</clipPath></defs>" +
      '<g class="c-body" fill="url(#' + id + 'g)">' + shapes + "</g>" +
      '<g class="c-hi" clip-path="url(#' + id + 'k)">' + hi + "</g>" +
      '<rect class="c-base" clip-path="url(#' + id + 'k)" x="0" y="70" width="200" height="14"/></svg>';
  }
  function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); } /* the same "random" every visit */
  function el(cls, style, html) { var e = document.createElement("span"); e.className = cls; if (style) e.setAttribute("style", style); if (html) e.innerHTML = html; return e; }
  function draw(k) {
    var back = el("lk-wx lk-wx--back"), front = el("lk-wx lk-wx--front"), i;
    /* the four kinds of rain are four different days: a light drizzle with the sun still out (and a faint rainbow),
       steady rain under grey cloud, heavy rain that hides the far hills and splashes on the jetty, and a storm with
       low dark cloud, driven rain, two lightning bolts and a choppy lake */
    var RAIN = {
      drizzle: { drops: 46, h: [6, 10], w: 1, t: [1.0, 1.4], sl: 0.06, rings: 5, clouds: 3, cw: [130, 200], cy: [210, 290], curtains: 0, splash: 0, caps: 0 },
      rain:    { drops: 90, h: [14, 24], w: 1.35, t: [0.62, 0.86], sl: 0.14, rings: 11, clouds: 3, cw: [170, 260], cy: [185, 265], curtains: 2, splash: 6, caps: 0 },
      heavy:   { drops: 160, h: [22, 34], w: 1.7, t: [0.44, 0.6], sl: 0.22, rings: 18, clouds: 4, cw: [210, 320], cy: [170, 240], curtains: 3, splash: 14, caps: 6 },
      storm:   { drops: 190, h: [26, 42], w: 1.8, t: [0.36, 0.5], sl: 0.36, rings: 18, clouds: 5, cw: [240, 360], cy: [160, 230], curtains: 4, splash: 16, caps: 12 }
    }[k];
    var clouds = RAIN ? RAIN.clouds : ({ partly: 2, cloudy: 5, snow: 4, fog: 0, wind: 3 }[k] || 0);
    var cw = RAIN ? RAIN.cw : [150, 290], cy = RAIN ? RAIN.cy : [165, 275];
    function span(r, i, j) { return r[0] + rnd(i, j) * (r[1] - r[0]); }
    /* two depths: far clouds sit higher, smaller and paler and drift slower; near ones are full size */
    for (i = 0; i < clouds; i++) {
      var far = clouds > 2 && i % 2 === 1, w = Math.round(span(cw, i, 3) * (far ? 0.68 : 1)), y = Math.round(span(cy, i, 2) + (far ? 34 : 0));
      back.appendChild(el("wx-cloud" + (far ? " wx-cloud--far" : "") + (k === "storm" ? " wx-cloud--storm" : ""),
        "left:" + (clouds <= 2 ? [30, 74][i] : 10 + (i / (clouds - 1)) * 80 + (rnd(i, 1) - 0.5) * 10).toFixed(1) + "%;bottom:calc(" + y + " * var(--lu));--w:" + w + ";--d:" + (-rnd(i, 4) * 40).toFixed(1) + "s", cloud(i + Math.floor(rnd(i, 30) * 3))));
    }
    /* in heavy rain and storms the clouds join into one low deck along the horizon */
    if (k === "rain" || k === "heavy" || k === "storm") back.insertBefore(el("wx-deck wx-deck--" + k), back.firstChild);
    if (k === "fog") for (i = 0; i < 4; i++) back.appendChild(el("wx-fog", "bottom:calc(" + (110 + i * 34) + " * var(--lu));--d:" + (-i * 9) + "s"));
    if (RAIN) {
      if (k === "drizzle") back.insertBefore(el("wx-bow", "", '<svg viewBox="0 0 200 100" aria-hidden="true"><path d="M8 100A92 92 0 0 1 192 100" stroke="#f3a6a0"/><path d="M15 100A85 85 0 0 1 185 100" stroke="#f6d27a"/><path d="M22 100A78 78 0 0 1 178 100" stroke="#a9d8b0"/><path d="M29 100A71 71 0 0 1 171 100" stroke="#a8c4ec"/></svg>'), back.firstChild);
      for (i = 0; i < RAIN.curtains; i++) back.appendChild(el("wx-curtain", "left:" + (10 + i * (80 / Math.max(1, RAIN.curtains - 1)) + (rnd(i, 21) - 0.5) * 8).toFixed(1) + "%;--w:" + Math.round(120 + rnd(i, 22) * 120) + ";--d:" + (-rnd(i, 23) * 6).toFixed(2) + "s;--sk:" + (-RAIN.sl * 45).toFixed(1) + "deg"));
      if (k === "heavy" || k === "storm") for (i = 0; i < 2; i++) back.appendChild(el("wx-fog wx-fog--rain", "bottom:calc(" + (128 + i * 26) + " * var(--lu));--d:" + (-i * 11) + "s"));
      for (i = 0; i < RAIN.drops; i++) front.appendChild(el("wx-drop", "left:" + (rnd(i, 5) * 112 - 6).toFixed(2) + "%;--d:" + (-rnd(i, 6) * 1.4).toFixed(2) + "s;--t:" + span(RAIN.t, i, 7).toFixed(2) + "s;--h:" + Math.round(span(RAIN.h, i, 8)) + ";--dw:" + RAIN.w + ";--sl:" + RAIN.sl));
      for (i = 0; i < RAIN.rings; i++) front.appendChild(el("wx-ring", "left:" + (4 + rnd(i, 9) * 92).toFixed(1) + "%;bottom:calc(" + Math.round(8 + rnd(i, 10) * 110) + " * var(--lu));--d:" + (-rnd(i, 11) * 2.4).toFixed(2) + "s;--rt:" + (k === "drizzle" ? 3.2 : k === "rain" ? 2.4 : 1.7) + "s"));
      for (i = 0; i < RAIN.splash; i++) front.appendChild(el("wx-splash", "left:calc((50% + 128 * var(--lu)) * " + (0.04 + rnd(i, 24) * 0.94).toFixed(3) + ");--d:" + (-rnd(i, 25) * 1.2).toFixed(2) + "s"));
      for (i = 0; i < RAIN.caps; i++) front.appendChild(el("wx-whitecap", "left:" + (4 + rnd(i, 26) * 92).toFixed(1) + "%;bottom:calc(" + Math.round(12 + rnd(i, 27) * 100) + " * var(--lu));--d:" + (-rnd(i, 28) * 3).toFixed(2) + "s"));
    }
    var flakes = { snow: 70 }[k] || 0;
    for (i = 0; i < flakes; i++) front.appendChild(el("wx-flake", "left:" + (rnd(i, 12) * 100).toFixed(2) + "%;--d:" + (-rnd(i, 13) * 9).toFixed(2) + "s;--t:" + (6 + rnd(i, 14) * 5).toFixed(2) + "s;--s:" + (3 + rnd(i, 15) * 4).toFixed(1) + ";--x:" + Math.round(-30 + rnd(i, 16) * 60)));
    if (k === "wind") for (i = 0; i < 9; i++) front.appendChild(el(i % 3 ? "wx-gust" : "wx-leaf", "bottom:calc(" + Math.round(70 + rnd(i, 17) * 190) + " * var(--lu));--d:" + (-rnd(i, 18) * 6).toFixed(2) + "s;--t:" + (3.4 + rnd(i, 19) * 2.4).toFixed(2) + "s"));
    if (k === "snow") front.appendChild(el("wx-cap"));
    if (k === "storm") { /* two strikes on their own clocks, each lighting the sky */
      var BOLT = '<svg viewBox="0 0 40 120" aria-hidden="true"><path d="M24 0L6 58H20L10 120L36 44H22L32 0Z"/></svg>';
      front.appendChild(el("wx-flash", "--fd:2s")); front.appendChild(el("wx-flash", "--fd:6.4s"));
      front.appendChild(el("wx-bolt", "left:76%;top:40%;--fd:2s", BOLT)); front.appendChild(el("wx-bolt wx-bolt--b", "left:18%;top:44%;--fd:6.4s", BOLT));
    }
    var veil = el("lk-veil");
    var sun = scene.querySelector(".lk-water"), slot = document.getElementById("heroPup");
    scene.insertBefore(back, sun);                       /* clouds and fog sit in the sky, behind the water and the jetty */
    scene.insertBefore(veil, slot);                       /* the grey of the day goes over the lake, under the two of them */
    scene.appendChild(front);                             /* what falls is in front of everything */
    function size() { front.style.setProperty("--fall", front.offsetHeight + "px"); }
    size(); window.addEventListener("resize", size);
  }
  /* the icon for each weather, drawn in the site's ink-and-sun style; clear shows a sun by day and a moon in dark mode */
  var CL_P = '<path class="i-cloud" d="M7.2 18.5h9.6a3.7 3.7 0 0 0 .4-7.38A5.2 5.2 0 0 0 7.4 9.9a3.3 3.3 0 0 0-.2 8.6z"/>';
  function icon(k) {
    var sun = '<g class="i-sun"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></g>',
      moon = '<path class="i-moon" d="M15.6 4.2a7.6 7.6 0 1 0 4.2 12.6 6.2 6.2 0 0 1-4.2-12.6z"/>', b;
    if (k === "clear") b = sun + moon;
    else if (k === "partly") b = '<g transform="translate(-3 -3) scale(.78)">' + sun + "</g>" + '<g transform="translate(2.5 2)">' + CL_P + "</g>";
    else if (k === "cloudy") b = '<g transform="translate(0 -1.5)">' + CL_P + "</g>";
    else if (k === "fog") b = '<path class="i-line" d="M4 9h16M6 13h12M4 17h16"/>';
    else if (k === "wind") b = '<path class="i-line" d="M3 9h11a2.6 2.6 0 1 0-2.6-2.6M3 13h15a2.8 2.8 0 1 1-2.8 2.8M3 17h7"/>';
    else {
      b = '<g transform="translate(0 -4)">' + CL_P + "</g>";
      if (k === "storm") b += '<path class="i-bolt" d="M12.8 15.2l-2.6 4h2.4l-1.2 3.4 3.8-4.8h-2.4l1.4-2.6z"/>';
      else if (k === "snow") b += '<g class="i-flake"><circle cx="8.5" cy="18.6" r="1.1"/><circle cx="12.5" cy="20.4" r="1.1"/><circle cx="16.5" cy="18.6" r="1.1"/></g>';
      else b += '<path class="i-drop" d="M8.8 16.6l-1 2.6M12.6 16.6l-1 2.6M16.4 16.6l-1 2.6' + (k === "heavy" ? "M10.7 20l-.8 2M14.5 20l-.8 2" : "") + '"/>';
    }
    return '<svg class="nav__wx-ico" viewBox="0 0 24 24" aria-hidden="true">' + b + "</svg>";
  }
  var done = false;
  function apply(rec) {
    if (done || !window.SunnyWeather) return false;
    var cl = rec ? window.SunnyWeather.climate(rec) : null, k = kindOf(cl);
    if (!k) return false;
    done = true;
    document.body.setAttribute("data-wx", k);
    if (k !== "clear") draw(k);
    if (line) { /* in the nav: a small weather icon, the temperature, and what it is ("Clear skies / near you") */
      var deg = cl.temp == null ? null : Math.round(F ? cl.temp * 9 / 5 + 32 : cl.temp), name = said(cl, k);
      line.innerHTML = icon(k) + (deg == null ? "" : '<span class="nav__wx-deg">' + deg + '<span class="nav__wx-unit">°' + (F ? "F" : "C") + "</span></span>") +
        '<span class="nav__wx-txt"><b></b><i>near you</i></span>';
      line.querySelector("b").textContent = name;
      line.setAttribute("aria-label", name + " near you" + (deg == null ? "" : ", " + deg + "°" + (F ? "F" : "C")));
      line.hidden = false;
      /* the nav is regrouped by script.js (brand | right-hand controls); the tag belongs at the front of the controls */
      (function seat(n) {
        var right = document.querySelector(".nav .nav__right");
        if (right) { if (line.parentNode !== right) right.insertBefore(line, right.firstChild); return; }
        if (n > 0) setTimeout(function () { seat(n - 1); }, 150);
      })(20);
    }
    return true;
  }
  function start() {
    var t = window.SunnyWeather && window.SunnyWeather.test();
    if (t !== undefined) { apply(t); return; }           /* a test weather; "offline" (null) keeps the plain sunrise */
    if (apply(cached())) return;
    /* nothing kept yet: the film may be fetching it right now. Look again once it has had its chance (it gives up at 2.4 s). */
    setTimeout(function () { apply(cached()); }, 3200);
  }
  if (reduced) document.body.classList.add("wx-still");
  start();
})();
