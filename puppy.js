/* Puppy: Sunny's sidekick. A small charcoal pup with amber eyes and a blue
   lightning mark, drawn as inline SVG in the same vector style as Sunny so
   the two read as one cast. Loaded by sunny.js only when the visitor picks
   Puppy or Together in the preferences panel.

   Puppy is the emotion: it moves, tilts, wags and reacts, and speaks rarely
   and briefly. It never answers questions; Sunny does that. In Together mode
   a small duo manager listens to Sunny's events (acts, speech, sleep, clicks,
   drags, sections, the Ask panel) and lets the two react to each other.

   API: Puppy.setMode("sunny" | "puppy" | "together") · Puppy.act(name) ·
        Puppy.emote(name) · Puppy.say(text) · Puppy.acts · Puppy.emotions */
(function (global) {
  "use strict";
  if (global.Puppy) return;
  var reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var finePointer = global.matchMedia && global.matchMedia("(pointer: fine)").matches;
  var INK = "#111111", FUR = "#2b2d33", FUR_D = "#202227", FUR_L = "#454851", EAR = "#6e5560", AMBER = "#e8a03a", BOLT = "#8cc0ff", BOLT_D = "#4d8dff";

  /* ---------- Art ---------- */
  function art() {
    return '' +
    '<svg class="puppy__svg" viewBox="0 0 220 220" aria-hidden="true" focusable="false" overflow="visible">' +
      '<ellipse class="p-shadow" cx="110" cy="207" rx="50" ry="6" fill="' + INK + '" fill-opacity="0.09"/>' +
      '<g class="p-char">' +
        '<g class="p-tail"><path d="M146 158 q10 -32 34 -48 q10 -6 12 6 q-6 30 -32 50 q-10 4 -14 -8 z" fill="' + FUR + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/><path d="M172 118 q6 -4 8 2 q-2 10 -8 14" fill="none" stroke="' + FUR_L + '" stroke-width="3" stroke-linecap="round"/></g>' +
        '<g class="p-legs-back"><rect class="p-leg p-leg--bl" x="70" y="156" width="22" height="42" rx="10" fill="' + FUR_D + '" stroke="' + INK + '" stroke-width="2.6"/><rect class="p-leg p-leg--br" x="128" y="156" width="22" height="42" rx="10" fill="' + FUR_D + '" stroke="' + INK + '" stroke-width="2.6"/></g>' +
        '<g class="p-body"><ellipse cx="110" cy="152" rx="54" ry="46" fill="' + FUR + '" stroke="' + INK + '" stroke-width="3"/>' +
          '<path class="p-chest" d="M84 134 q26 -20 52 0 q4 30 -26 44 q-30 -14 -26 -44 z" fill="' + FUR_L + '" opacity="0.9"/>' +
          '<path d="M64 150 l-6 -8 l8 2 M156 150 l6 -8 l-8 2 M78 184 l-5 7 l8 -2 M142 184 l5 7 l-8 -2" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</g>' +
        '<g class="p-legs-front"><g class="p-leg p-leg--fl"><rect x="84" y="166" width="20" height="34" rx="9" fill="' + FUR + '" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="94" cy="197" rx="13" ry="6.5" fill="' + FUR_L + '" stroke="' + INK + '" stroke-width="2.4"/></g>' +
          '<g class="p-leg p-leg--fr"><rect x="116" y="166" width="20" height="34" rx="9" fill="' + FUR + '" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="126" cy="197" rx="13" ry="6.5" fill="' + FUR_L + '" stroke="' + INK + '" stroke-width="2.4"/></g></g>' +
        '<g class="p-head">' +
          '<g class="p-ear p-ear--l"><path d="M64 96 L50 26 L100 70 Z" fill="' + FUR + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M68 86 L60 44 L88 70 Z" fill="' + EAR + '"/></g>' +
          '<g class="p-ear p-ear--r"><path d="M156 96 L170 26 L120 70 Z" fill="' + FUR + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M152 86 L160 44 L132 70 Z" fill="' + EAR + '"/></g>' +
          '<circle cx="110" cy="98" r="50" fill="' + FUR + '" stroke="' + INK + '" stroke-width="3"/>' +
          '<path d="M74 124 q-10 8 -2 18 M146 124 q10 8 2 18 M62 92 l-8 -4 l6 10" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<ellipse cx="110" cy="118" rx="26" ry="16" fill="' + FUR_L + '" opacity="0.55"/>' +
          '<path class="p-bolt" d="M112 50 l9 -14 l-3 10 h8 l-13 17 l4 -11 h-8 z" fill="' + BOLT + '" stroke="' + BOLT_D + '" stroke-width="1.4" stroke-linejoin="round"/>' +
          '<g class="p-blush"><ellipse cx="78" cy="118" rx="8" ry="4.5" fill="#f08c9a" opacity="0.75"/><ellipse cx="142" cy="118" rx="8" ry="4.5" fill="#f08c9a" opacity="0.75"/></g>' +
          '<g class="p-brows" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"><path class="p-brow p-brow--l" d="M80 80 l18 6"/><path class="p-brow p-brow--r" d="M140 80 l-18 6"/></g>' +
          '<g class="p-eyes">' +
            '<g class="p-eye p-eye--l"><ellipse cx="92" cy="100" rx="11.5" ry="13.5" fill="' + AMBER + '" stroke="' + INK + '" stroke-width="2.2"/><g class="p-look"><ellipse cx="93" cy="101" rx="7" ry="9" fill="' + INK + '"/><circle cx="96.5" cy="95.5" r="3" fill="#fff"/><circle cx="89.5" cy="104.5" r="1.4" fill="#fff"/></g></g>' +
            '<g class="p-eye p-eye--r"><ellipse cx="128" cy="100" rx="11.5" ry="13.5" fill="' + AMBER + '" stroke="' + INK + '" stroke-width="2.2"/><g class="p-look"><ellipse cx="129" cy="101" rx="7" ry="9" fill="' + INK + '"/><circle cx="132.5" cy="95.5" r="3" fill="#fff"/><circle cx="125.5" cy="104.5" r="1.4" fill="#fff"/></g></g>' +
            '<path class="p-eye-happy" d="M81 103 Q92 90 103 103" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
            '<path class="p-eye-happy" d="M117 103 Q128 90 139 103" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
            '<g class="p-eye-x" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"><path d="M85 93l14 14M99 93l-14 14"/><path d="M121 93l14 14M135 93l-14 14"/></g>' +
            '<g class="p-lids"><path d="M79 86 h26 v12 q-13 6 -26 0 z" fill="' + FUR + '"/><path d="M115 86 h26 v12 q-13 6 -26 0 z" fill="' + FUR + '"/></g>' +
          '</g>' +
          '<path class="p-nose" d="M103 118 q7 -5 14 0 q-2 8 -7 9 q-5 -1 -7 -9 z" fill="' + INK + '"/>' +
          '<g class="p-mouth" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
            '<path class="p-m p-m--rest" d="M110 127 v4 M103 131 q7 6 14 0"/>' +
            '<path class="p-m p-m--smile" d="M98 128 q12 12 24 0"/>' +
            '<circle class="p-m p-m--o" cx="110" cy="134" r="4.5" fill="' + INK + '" stroke="none"/>' +
            '<path class="p-m p-m--frown" d="M101 136 q9 -8 18 0"/>' +
            '<path class="p-m p-m--wavy" d="M100 132 q3 -5 6 0 t6 0 t6 0"/>' +
          '</g>' +
          '<ellipse class="p-tongue" cx="110" cy="136" rx="5" ry="6.5" fill="#e8707a" stroke="' + INK + '" stroke-width="1.6"/>' +
          '<path class="p-tear" d="M80 112 c-5 7 -5 11 0 11 c5 0 5 -4 0 -11 Z" fill="#4d8dff"/>' +
        '</g>' +
      '</g>' +
      '<g class="p-fx p-fx--zzz" fill="' + INK + '" font-family="JetBrains Mono, ui-monospace, monospace" font-weight="500"><text class="p-z p-z1" x="156" y="70" font-size="12">z</text><text class="p-z p-z2" x="168" y="56" font-size="15">z</text><text class="p-z p-z3" x="182" y="40" font-size="19">Z</text></g>' +
      '<g class="p-fx p-fx--q" fill="' + INK + '" font-family="Space Grotesk, Inter, sans-serif" font-weight="600"><text x="158" y="56" font-size="26">?</text></g>' +
      '<g class="p-fx p-fx--hearts" fill="#de364d"><g transform="translate(160 66)"><path class="p-heart p-heart1" d="M0 4 C0 -2 8 -2 8 4 C8 9 0 14 0 14 C0 14 -8 9 -8 4 C-8 -2 0 -2 0 4Z"/></g><g transform="translate(178 88) scale(0.7)"><path class="p-heart p-heart2" d="M0 4 C0 -2 8 -2 8 4 C8 9 0 14 0 14 C0 14 -8 9 -8 4 C-8 -2 0 -2 0 4Z"/></g></g>' +
      '<g class="p-fx p-fx--stars" fill="#FFC93C" stroke="' + INK + '" stroke-width="1.5"><g transform="translate(48 52)"><path class="p-star" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"/></g><g transform="translate(176 44) scale(0.7)"><path class="p-star" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"/></g></g>' +
      '<g class="p-fx p-fx--lines" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"><path d="M34 90 q-8 8 0 16 M24 80 q-10 14 0 28 M186 90 q8 8 0 16 M196 80 q10 14 0 28"/></g>' +
      '<g class="p-fx p-fx--notes" fill="' + INK + '" font-family="Space Grotesk, Inter, sans-serif"><text class="p-note p-note1" x="160" y="60" font-size="20">♪</text><text class="p-note p-note2" x="178" y="44" font-size="16">♫</text></g>' +
      '<g class="p-fx p-fx--sweat"><path d="M160 80 c-5 7 -5 11 0 11 c5 0 5 -4 0 -11 Z" fill="#4d8dff"/></g>' +
    '</svg>';
  }

  /* ---------- Lines: short, rare, mostly actions ---------- */
  var LINES = {
    idle: ["Woof.", "Wrf?", "*sniff sniff*", "*tilts head*", "Hm?", "*ears up*", "Boop?", "…", "Squirrel!", "*wags*"],
    click: ["Woof!", "Wrf!", "*happy wiggle*", "Again!", "*tail goes wild*"],
    double: ["*zoomies*", "WOOF WOOF", "*bounce bounce*"],
    triple: ["*hides*", "Too much. Too much.", "*flops over*"],
    right: ["*shy*", "*hides behind Sunny*", "…woof."],
    near: ["*sniffs your cursor*", "*wag*"],
    sunnySpeaks: ["*listens*", "*nods seriously*", "*tilts head*"],
    distracted: ["*looks at a leaf*", "…what was that?", "*sniff*"],
    dance: ["*joins in*", "*wiggle wiggle*"],
    sleep: ["*curls up*", "zzz"],
    wake: ["*blinks*", "Wrf?"],
    sunnyClicked: ["*looks at Sunny, then at you*", "Hm?"],
    drag: ["*follows*", "Where are we going?", "*bounces after Sunny*"],
    nudge: ["*nudge*", "Pay attention to me.", "*boop*"],
    story: ["*sits quietly*", "*curious*"],
    contact: ["Woof! (That's hello.)", "*offers paw*"],
    skills: ["*excited bounce*", "*spins*"],
    end: ["*zoomies*", "Made it!"],
    answer: ["*nods*", "*proud of Sunny*", "*tilts head*"]
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- DOM ---------- */
  var root, bubble, svg, lookL, lookR, mode = "sunny", actTimer = 0, sayTimer = 0, emoteTimer = 0, asleep = false, cur = null, lastBubble = 0, lastInput = Date.now(), nextAmbient = 0, lastAct = {}, recent = [];
  var PRI = { ambient: 1, duo: 2, section: 3, event: 4, direct: 5 };
  var CONFIG = { tick: 2200, gap: [14000, 26000], bubbleGap: 16000, maxProactive: 5, duoGap: [40000, 90000] };
  var proactive = 0, nextDuo = 0;

  function build() {
    root = document.createElement("div");
    root.className = "puppy is-off";
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", "Puppy, Sunny’s sidekick");
    root.innerHTML = '<div class="puppy__char"><div class="puppy__bubble" aria-hidden="true"></div>' + art() + '</div>';
    document.body.appendChild(root);
    bubble = root.querySelector(".puppy__bubble");
    svg = root.querySelector(".puppy__svg");
    var looks = root.querySelectorAll(".p-look"); lookL = looks[0]; lookR = looks[1];
    if (!reduced) { wire(); setInterval(tick, CONFIG.tick); }
    else root.classList.add("is-static");
    setTimeout(function () { root.classList.add("is-in"); }, 60);
  }
  function sense() { return global.Sunny && Sunny.sense ? Sunny.sense() : { reading: false, idle: true, askOpen: false, talking: false }; }

  /* ---------- Speech ---------- */
  function say(text, ms) {
    if (!root || root.classList.contains("is-off")) return false;
    clearTimeout(sayTimer);
    bubble.textContent = text;
    root.classList.add("is-talking");
    sayTimer = setTimeout(function () { root.classList.remove("is-talking"); }, ms || Math.max(1600, 800 + text.length * 50));
    return true;
  }
  /* rationed, and never over Sunny's bubble */
  function speak(text, ms, force) {
    var now = Date.now(), s = sense();
    if (s.askOpen || s.talking) return false;
    if (!force && (s.reading || proactive >= CONFIG.maxProactive)) return false;
    if (now - lastBubble < (force ? 3000 : CONFIG.bubbleGap)) return false;
    lastBubble = now; if (!force) proactive++;
    return say(text, ms);
  }

  /* ---------- Emotions ---------- */
  var EMOTIONS = { happy: 1800, curious: 2200, surprised: 1300, sleepy: 3000, excited: 1800, sad: 2400, shy: 2000, love: 2200, proud: 2000, dizzy: 1800, scared: 1600 };
  function emote(name, ms) {
    if (!EMOTIONS[name] || !root) return;
    clearTimeout(emoteTimer);
    root.removeAttribute("data-emotion"); void root.offsetWidth;
    root.setAttribute("data-emotion", name);
    emoteTimer = setTimeout(function () { root.removeAttribute("data-emotion"); }, ms || EMOTIONS[name]);
  }

  /* ---------- Acts ---------- */
  var ACTS = {
    wag: { ms: 2200 }, tilt: { ms: 2000 }, twitch: { ms: 900 }, hop: { ms: 800 }, sniff: { ms: 2600 }, scratch: { ms: 2200 },
    shake: { ms: 1400 }, peek: { ms: 2800 }, bounce: { ms: 2000 }, sit: { ms: 6000 }, lie: { ms: 8000 }, sleep: { ms: 0 },
    stretch: { ms: 2200 }, spin: { ms: 1600 }, listen: { ms: 5000 }, howl: { ms: 2600 }, nudge: { ms: 1800 }, paw: { ms: 1800 }, yawn: { ms: 1800 }
  };
  var actToken = 0;
  function later(fn, ms) { var mine = actToken; return setTimeout(function () { if (actToken === mine) fn(); }, ms); }
  function act(name, pri) {
    var a = ACTS[name];
    if (!a || reduced || !root || root.classList.contains("is-off")) return false;
    if (pri == null) pri = PRI.event;
    var now = Date.now();
    if (cur && now < cur.until && pri < cur.pri) return false;
    clearTimeout(actTimer); actToken++;
    root.removeAttribute("data-act"); void root.offsetWidth;
    root.setAttribute("data-act", name);
    lastAct[name] = now; recent.push(name); if (recent.length > 4) recent.shift();
    if (name === "sleep") { asleep = true; cur = { name: name, pri: 0, until: Infinity }; return true; }
    if (name === "sniff") later(function () { look(0.6, 0.8, 900); }, 400);
    if (name === "peek") { later(function () { look(-1, -0.2, 900); }, 300); later(function () { look(1, -0.2, 900); }, 1400); }
    if (name === "scratch") later(function () { emote("happy", 900); }, 1800);
    if (name === "spin") later(function () { emote("dizzy", 1200); }, 1500);
    if (name === "howl") later(function () { emote("proud", 1200); }, 2400);
    cur = { name: name, pri: pri, until: now + a.ms };
    actTimer = setTimeout(function () { root.removeAttribute("data-act"); cur = null; }, a.ms);
    return true;
  }
  function stopAct() { clearTimeout(actTimer); actToken++; if (root) root.removeAttribute("data-act"); cur = null; }
  function wake(line) {
    if (!asleep) return;
    asleep = false; stopAct(); emote("surprised", 900);
    if (line !== false) speak(pick(LINES.wake), 1600, true);
  }
  /* pupils: dx, dy in -1..1 */
  var lookTimer = 0;
  function look(dx, dy, ms) {
    if (!lookL) return;
    var t = "translate(" + (dx * 4).toFixed(1) + "px," + (dy * 3).toFixed(1) + "px)";
    lookL.style.transform = t; lookR.style.transform = t;
    clearTimeout(lookTimer);
    if (ms) lookTimer = setTimeout(function () { lookL.style.transform = ""; lookR.style.transform = ""; }, ms);
  }

  /* ---------- Behaviour: calm idle, occasional reactions ---------- */
  var POOL = { base: { twitch: 5, wag: 4, tilt: 3, sniff: 3, peek: 3, scratch: 2, stretch: 2, sit: 2, hop: 1, shake: 1, spin: 1, yawn: 2, line: 2 },
    quiet: { twitch: 5, tilt: 2, peek: 2, sit: 3, lie: 2, yawn: 2, stretch: 1 } };
  var section = null, sectionLabel = null;
  var SECTION_BOOST = { story: { sit: 4, peek: 2 }, writing: { lie: 4, sit: 2, yawn: 2 }, skills: { bounce: 3, spin: 2, hop: 2 }, gallery: { peek: 3, sniff: 2 }, process: { hop: 2, sniff: 2 }, contact: { paw: 4, wag: 2 }, work: { sniff: 3, peek: 2 } };
  function choose(quietOnly) {
    var pool = quietOnly ? POOL.quiet : POOL.base, boost = (!quietOnly && SECTION_BOOST[section]) || {}, now = Date.now(), list = [], total = 0, k;
    var merged = {}; for (k in pool) merged[k] = pool[k]; for (k in boost) merged[k] = (merged[k] || 0) + boost[k] * 2;
    for (k in merged) {
      if (k !== "line" && !ACTS[k]) continue;
      if (lastAct[k] && now - lastAct[k] < 60000) continue;
      if (recent.indexOf(k) > -1) continue;
      list.push([k, merged[k]]); total += merged[k];
    }
    if (!list.length) return null;
    var r = Math.random() * total;
    for (var i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) return list[i][0]; }
    return list[list.length - 1][0];
  }
  function tick() {
    var now = Date.now(), s = sense();
    if (document.hidden || root.classList.contains("is-off")) return;
    if (asleep) return;
    if (mode === "puppy" && now - lastInput > 50000 && !s.askOpen) { act("sleep"); speak(pick(LINES.sleep), 1600); return; }
    if (now < nextAmbient || (cur && now < cur.until) || root.hasAttribute("data-emotion")) return;
    var gap = CONFIG.gap;
    nextAmbient = now + gap[0] + Math.random() * (gap[1] - gap[0]) + (s.reading ? 8000 : 0);
    if (mode === "together" && !s.reading && now > nextDuo && !s.askOpen) { nextDuo = now + CONFIG.duoGap[0] + Math.random() * (CONFIG.duoGap[1] - CONFIG.duoGap[0]); if (duoIdle()) return; }
    var what = choose(s.reading || s.askOpen);
    if (!what) return;
    if (what === "line") { if (!s.reading) speak(pick(LINES.idle)); return; }
    lastAct[what] = now;
    act(what, PRI.ambient);
  }

  /* ---------- Interaction ---------- */
  var px = -1e4, py = -1e4, raf = 0, near = false, taps = [], lastNear = 0;
  function wire() {
    if (finePointer) global.addEventListener("pointermove", function (e) {
      px = e.clientX; py = e.clientY; lastInput = Date.now();
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    global.addEventListener("keydown", function () { lastInput = Date.now(); if (mode === "puppy") wake(false); });
    global.addEventListener("scroll", function () { lastInput = Date.now(); if (mode === "puppy") wake(false); }, { passive: true });
    svg.addEventListener("click", function () {
      var now = Date.now();
      taps = taps.filter(function (t) { return now - t < 1400; }); taps.push(now);
      lastInput = now; wake(false); stopAct();
      if (taps.length >= 3) { emote("dizzy", 1800); act("lie", PRI.direct); say(pick(LINES.triple)); }
      else if (taps.length === 2) { emote("excited", 1800); act("bounce", PRI.direct); say(pick(LINES.double)); if (mode === "together") sunnyReact("surprised", 1000); }
      else { emote("happy", 1600); act("wag", PRI.direct); say(pick(LINES.click)); if (mode === "together" && Math.random() < 0.4) sunnyReact("laugh", 1200, pick(["He likes you.", "Careful, he never stops.", "Yes, he's always like this."])); }
    });
    svg.addEventListener("contextmenu", function (e) { e.preventDefault(); stopAct(); emote("shy", 2000); say(pick(LINES.right)); });
    document.addEventListener("visibilitychange", function () { root.classList.toggle("is-paused", document.hidden); if (!document.hidden && !asleep && mode === "puppy") { emote("excited", 1200); act("wag", PRI.event); } });
    /* home sections and case parts, from Sunny's context */
    if (global.Sunny && Sunny.on) {
      Sunny.on("section", function (d) {
        section = d.id; sectionLabel = d.label;
        if (d.first) {
          if (section === "story") { emote("shy", 2000); speak(pick(LINES.story), 1800); }
          else if (section === "skills") { act("bounce", PRI.section); speak(pick(LINES.skills), 1600); }
          else if (section === "contact") { act("paw", PRI.section); speak(pick(LINES.contact), 2000); }
          else if (section === "writing") { act("lie", PRI.section); }
          else if (section === "gallery" || section === "work") { act("sniff", PRI.section); }
          else if (d.label === "Decisions" || d.label === "Your thinking") { emote("curious", 2000); }
        }
      });
      Sunny.on("end", function () { act("bounce", PRI.event); speak(pick(LINES.end), 1600, true); });
      Sunny.on("ask", function (on) { if (on) { stopAct(); act("sit", PRI.event); look(-0.6, -0.8, 4000); } else { stopAct(); look(0, 0, 10); } });
      Sunny.on("answer", function () { if (Math.random() < 0.5) emote("curious", 1800); else emote("proud", 1600); if (Math.random() < 0.25) speak(pick(LINES.answer), 1500, true); });
    }
  }
  function update() {
    raf = 0;
    if (root.classList.contains("is-off")) return;
    var r = svg.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 240);
    if (!asleep && !root.hasAttribute("data-act")) look(dx / d * k, dy / d * k * 0.8);
    var n = d < r.width * 1.2;
    if (n !== near) {
      near = n; root.classList.toggle("is-near", n);
      if (n && Date.now() - lastNear > 12000 && !asleep) { lastNear = Date.now(); act("wag", PRI.event); if (Math.random() < 0.3) speak(pick(LINES.near), 1500, true); }
    }
  }

  /* ---------- Duo: Sunny leads, Puppy reacts ---------- */
  function sunnyReact(emotion, ms, line) {
    var S = global.Sunny; if (!S || mode !== "together") return;
    var s = sense(); if (s.asleep || s.askOpen) return;
    S.emote(emotion, ms);
    if (line) S.say(line, 2200);
  }
  function duoIdle() {
    var S = global.Sunny, s = sense();
    if (!S || s.asleep || s.busy || cur) return false;
    var r = Math.random();
    if (r < 0.3) { /* look at each other */
      look(1, -0.3, 2200); if (S.look) S.look(-1, 0.2, 2200);
      setTimeout(function () { emote("happy", 1200); }, 1400);
      return true;
    }
    if (r < 0.55) { /* a nudge, Sunny turns, surprised */
      act("nudge", PRI.duo); speak(pick(LINES.nudge), 1600);
      setTimeout(function () { sunnyReact("surprised", 1200, pick(["Hey!", "What now?", "I'm working here."])); }, 900);
      setTimeout(function () { sunnyReact("love", 1800); emote("love", 1800); }, 3200);
      return true;
    }
    if (r < 0.75) { /* sit together */
      act("sit", PRI.duo); if (S.look) S.look(-0.6, 0.3, 3000);
      return true;
    }
    /* a small coordinated act: Sunny sings, Puppy howls */
    if (S.act("sing")) { setTimeout(function () { act("howl", PRI.duo); }, 1400); return true; }
    return false;
  }
  function wireDuo() {
    var S = global.Sunny; if (!S || !S.on) return;
    S.on("act", function (d) {
      if (mode !== "together") return;
      if (d.name === "dance") setTimeout(function () { act("bounce", PRI.duo); speak(pick(LINES.dance), 1500); }, 1200);
      else if (d.name === "sleep") setTimeout(function () { stopAct(); act("sleep"); speak(pick(LINES.sleep), 1600, true); }, 1800);
      else if (d.name === "sing") setTimeout(function () { act("howl", PRI.duo); }, 1400);
      else if (d.name === "wave" && Math.random() < 0.5) setTimeout(function () { act("wag", PRI.duo); }, 400);
      else if ((d.name === "swim" || d.name === "skate" || d.name === "cycle") && Math.random() < 0.6) setTimeout(function () { emote("excited", 1500); }, 600);
    });
    S.on("wake", function () { if (mode === "together") wake(); });
    S.on("say", function () {
      if (mode !== "together" || asleep) return;
      if (cur && cur.pri >= PRI.event) return;
      act("listen", PRI.duo); look(1, -0.4, 2600);
      actToken; setTimeout(function () { if (root.getAttribute("data-act") === "listen" && Math.random() < 0.5) { act("tilt", PRI.duo); } else if (root.getAttribute("data-act") === "listen") { stopAct(); act("sniff", PRI.duo); } }, 3200);
    });
    S.on("click", function () {
      if (mode !== "together" || asleep) return;
      stopAct(); look(1, -0.3, 900); setTimeout(function () { look(-0.4, -0.6, 900); }, 1000);
      if (Math.random() < 0.3) speak(pick(LINES.sunnyClicked), 1500, true);
    });
    S.on("drag", function (on) {
      if (mode !== "together") return;
      if (on) { stopAct(); emote("excited", 2500); act("bounce", PRI.event); speak(pick(LINES.drag), 1600, true); }
      else { act("hop", PRI.event); }
    });
    S.on("emote", function (name) {
      if (mode !== "together" || asleep) return;
      if (name === "sad") emote("sad", 1800);
      else if (name === "excited" || name === "laugh") { if (Math.random() < 0.5) act("wag", PRI.duo); }
    });
    S.on("visible", function () { if (mode === "together") { wake(false); act("wag", PRI.event); } });
  }

  /* ---------- Modes ---------- */
  function setMode(m) {
    if (["sunny", "puppy", "together"].indexOf(m) < 0) m = "sunny";
    mode = m;
    if (!root) return;
    if (root.getAttribute("data-mode") === m) return;
    root.setAttribute("data-mode", m);
    root.classList.toggle("is-off", m === "sunny");
    root.classList.toggle("is-duo", m === "together");
    root.classList.toggle("is-solo", m === "puppy");
    if (m === "sunny") { stopAct(); root.classList.remove("is-talking"); }
    else if (!reduced) { stopAct(); asleep = false; setTimeout(function () { emote("happy", 1400); act("wag", PRI.event); }, 350); }
    root.setAttribute("aria-hidden", String(m === "sunny"));
  }

  function init() {
    build(); wireDuo();
    var pref = "sunny"; try { pref = localStorage.getItem("pref:companion") || "sunny"; } catch (e) { /* ignore */ }
    setMode(global.Sunny && Sunny.mode ? Sunny.mode() : pref);
  }
  global.Puppy = {
    setMode: setMode, mode: function () { return mode; },
    act: function (n) { act(n, PRI.direct); }, emote: function (n, ms) { emote(n, ms); }, say: function (t, ms) { say(t, ms); },
    acts: Object.keys(ACTS), emotions: Object.keys(EMOTIONS), el: null, config: CONFIG,
    debug: function () { return { mode: mode, cur: cur, asleep: asleep, proactive: proactive, recent: recent.slice(), section: section }; }
  };
  var tries = 0, t = setInterval(function () {
    if (global.Sunny && Sunny.el) { clearInterval(t); init(); global.Puppy.el = root; }
    else if (++tries > 80) clearInterval(t);
  }, 100);
})(window);
